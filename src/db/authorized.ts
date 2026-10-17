import "server-only";

import { sql } from "drizzle-orm";

import { requireApplicationUser, requireClerkSession } from "@/lib/auth";

import { getDb, type Database } from "./index";

export type AuthorizedTransaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

export async function withAuthorizedTransaction<T>(
  callback: (tx: AuthorizedTransaction, user: Awaited<ReturnType<typeof requireApplicationUser>>) => Promise<T>,
): Promise<T> {
  const user = await requireApplicationUser();

  return getDb().transaction(async tx => {
    await tx.execute(sql`select set_config('app.clerk_user_id', ${user.clerkUserId}, true)`);
    await tx.execute(sql`select set_config('app.user_id', ${user.id}::text, true)`);
    return callback(tx, user);
  });
}

export async function withClerkIdentityTransaction<T>(
  callback: (tx: AuthorizedTransaction, identity: Awaited<ReturnType<typeof requireClerkSession>>) => Promise<T>,
): Promise<T> {
  const identity = await requireClerkSession();

  return getDb().transaction(async tx => {
    await tx.execute(sql`select set_config('app.clerk_user_id', ${identity.clerkUserId}, true)`);
    return callback(tx, identity);
  });
}
