import "server-only";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { users } from "@/db/schema";

export class AuthenticationError extends Error {
  readonly status = 401 as const;

  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export async function requireClerkSession(): Promise<{ clerkUserId: string }> {
  const { userId } = await auth();
  if (!userId) {
    throw new AuthenticationError();
  }
  return { clerkUserId: userId };
}

export async function requireApplicationUser() {
  const { clerkUserId } = await requireClerkSession();
  const [user] = await getDb()
    .select()
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  if (!user) {
    throw new AuthenticationError("Authenticated user is not initialized");
  }

  return user;
}
