import "server-only";

import { currentUser } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";

import { withClerkIdentityTransaction } from "@/db/authorized";
import { users, workspaceMembers, workspaces } from "@/db/schema";
import { sql } from "drizzle-orm";

function defaultWorkspaceSlug(userId: string): string {
  return `personal-${userId}`;
}

export async function initializeCurrentUserWorkspace() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    throw new Error("Cannot initialize a missing Clerk user");
  }

  const email = clerkUser.emailAddresses.find(
    address => address.id === clerkUser.primaryEmailAddressId,
  )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) {
    throw new Error("Cannot initialize a Clerk user without an email address");
  }

  return withClerkIdentityTransaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({
        clerkUserId: clerkUser.id,
        email,
        displayName: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null,
      })
      .onConflictDoUpdate({
        target: users.clerkUserId,
        set: { email, updatedAt: new Date() },
      })
      .returning();

    if (!user) {
      throw new Error("Application user initialization failed");
    }

    await tx.execute(sql`select set_config('app.user_id', ${user.id}::text, true)`);

    const slug = defaultWorkspaceSlug(user.id);
    let [workspace] = await tx
      .select()
      .from(workspaces)
      .where(and(eq(workspaces.ownerUserId, user.id), eq(workspaces.workspaceType, "personal")))
      .limit(1);

    if (!workspace) {
      [workspace] = await tx
        .insert(workspaces)
        .values({
          name: `${user.displayName ?? "My"} Workspace`,
          slug,
          ownerUserId: user.id,
          workspaceType: "personal",
        })
        .onConflictDoNothing({ target: workspaces.slug })
        .returning();
    }

    if (!workspace) {
      [workspace] = await tx
        .select()
        .from(workspaces)
        .where(eq(workspaces.slug, slug))
        .limit(1);
    }

    if (!workspace) {
      throw new Error("Default workspace initialization failed");
    }

    await tx
      .insert(workspaceMembers)
      .values({ workspaceId: workspace.id, userId: user.id, role: "owner" })
      .onConflictDoUpdate({
        target: [workspaceMembers.workspaceId, workspaceMembers.userId],
        set: { role: "owner" },
      });

    return { user, workspace };
  });
}
