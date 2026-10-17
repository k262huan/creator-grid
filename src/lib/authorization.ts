import "server-only";

import { and, eq } from "drizzle-orm";
import { z } from "zod";

import type { Database } from "@/db";
import { assets, contentItems, workspaceMembers } from "@/db/schema";

const uuidSchema = z.string().uuid();

export type WorkspaceRole = "owner" | "editor";

export type WorkspaceAuthorizationStore = {
  findMembership: (userId: string, workspaceId: string) => Promise<{ role: string } | undefined>;
  findContentItem: (contentItemId: string) => Promise<{ id: string; workspaceId: string } | undefined>;
  findAsset: (assetId: string) => Promise<{ id: string; workspaceId: string } | undefined>;
};

export function createWorkspaceAuthorizationStore(db: Database): WorkspaceAuthorizationStore {
  return {
    async findMembership(userId, workspaceId) {
      const [membership] = await db
        .select({ role: workspaceMembers.role })
        .from(workspaceMembers)
        .where(and(eq(workspaceMembers.userId, userId), eq(workspaceMembers.workspaceId, workspaceId)))
        .limit(1);
      return membership;
    },
    async findContentItem(contentItemId) {
      const [contentItem] = await db
        .select({ id: contentItems.id, workspaceId: contentItems.workspaceId })
        .from(contentItems)
        .where(eq(contentItems.id, contentItemId))
        .limit(1);
      return contentItem;
    },
    async findAsset(assetId) {
      const [asset] = await db
        .select({ id: assets.id, workspaceId: assets.workspaceId })
        .from(assets)
        .where(eq(assets.id, assetId))
        .limit(1);
      return asset;
    },
  };
}

export class AuthorizationError extends Error {
  readonly status: 401 | 403;

  constructor(message: string, status: 401 | 403) {
    super(message);
    this.name = "AuthorizationError";
    this.status = status;
  }
}

function requireUuid(value: string, field: string): string {
  const result = uuidSchema.safeParse(value);
  if (!result.success) {
    throw new AuthorizationError(`Invalid ${field}`, 403);
  }
  return result.data;
}

function normalizeRole(role: string): WorkspaceRole {
  if (role === "owner" || role === "editor") {
    return role;
  }
  throw new AuthorizationError("Workspace membership is invalid", 403);
}

export async function requireWorkspaceMember(
  store: WorkspaceAuthorizationStore,
  actorUserId: string,
  workspaceId: string,
  minimumRole: WorkspaceRole = "editor",
): Promise<{ userId: string; workspaceId: string; role: WorkspaceRole }> {
  const userId = requireUuid(actorUserId, "actor user ID");
  const authorizedWorkspaceId = requireUuid(workspaceId, "workspace ID");
  const membership = await store.findMembership(userId, authorizedWorkspaceId);

  if (!membership) {
    throw new AuthorizationError("Workspace access denied", 403);
  }

  const role = normalizeRole(membership.role);
  if (minimumRole === "owner" && role !== "owner") {
    throw new AuthorizationError("Owner permission required", 403);
  }

  return { userId, workspaceId: authorizedWorkspaceId, role };
}

export async function requireContentItemAccess(
  store: WorkspaceAuthorizationStore,
  actorUserId: string,
  contentItemId: string,
): Promise<{ userId: string; contentItemId: string; workspaceId: string; role: WorkspaceRole }> {
  const userId = requireUuid(actorUserId, "actor user ID");
  const authorizedContentItemId = requireUuid(contentItemId, "content item ID");
  const contentItem = await store.findContentItem(authorizedContentItemId);

  if (!contentItem) {
    throw new AuthorizationError("Content item not found", 403);
  }

  const membership = await requireWorkspaceMember(store, userId, contentItem.workspaceId);
  return { ...membership, contentItemId: authorizedContentItemId };
}

export async function requireAssetAccess(
  store: WorkspaceAuthorizationStore,
  actorUserId: string,
  assetId: string,
): Promise<{ userId: string; assetId: string; workspaceId: string; role: WorkspaceRole }> {
  const userId = requireUuid(actorUserId, "actor user ID");
  const authorizedAssetId = requireUuid(assetId, "asset ID");
  const asset = await store.findAsset(authorizedAssetId);

  if (!asset) {
    throw new AuthorizationError("Asset not found", 403);
  }

  const membership = await requireWorkspaceMember(store, userId, asset.workspaceId);
  return { ...membership, assetId: authorizedAssetId };
}

export async function requireContentAssetLinkAccess(
  store: WorkspaceAuthorizationStore,
  actorUserId: string,
  contentItemId: string,
  assetId: string,
): Promise<{ userId: string; contentItemId: string; assetId: string; workspaceId: string; role: WorkspaceRole }> {
  const userId = requireUuid(actorUserId, "actor user ID");
  const authorizedContentItemId = requireUuid(contentItemId, "content item ID");
  const authorizedAssetId = requireUuid(assetId, "asset ID");
  const [contentItem, asset] = await Promise.all([
    store.findContentItem(authorizedContentItemId),
    store.findAsset(authorizedAssetId),
  ]);

  if (!contentItem || !asset) {
    throw new AuthorizationError("Content or asset not found", 403);
  }
  if (contentItem.workspaceId !== asset.workspaceId) {
    throw new AuthorizationError("Content and asset must belong to the same workspace", 403);
  }

  const membership = await requireWorkspaceMember(store, userId, contentItem.workspaceId);
  return { ...membership, contentItemId: authorizedContentItemId, assetId: authorizedAssetId };
}

export async function requireWorkspaceOwner(
  store: WorkspaceAuthorizationStore,
  actorUserId: string,
  workspaceId: string,
): Promise<{ userId: string; workspaceId: string; role: "owner" }> {
  const authorization = await requireWorkspaceMember(store, actorUserId, workspaceId, "owner");
  return { ...authorization, role: "owner" };
}
