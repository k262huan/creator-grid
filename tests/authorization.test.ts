import { describe, expect, it } from "vitest";

import {
  AuthorizationError,
  requireAssetAccess,
  requireContentAssetLinkAccess,
  requireContentItemAccess,
  requireWorkspaceMember,
  requireWorkspaceOwner,
  type WorkspaceAuthorizationStore,
} from "../src/lib/authorization";

const userId = "11111111-1111-4111-8111-111111111111";
const otherUserId = "22222222-2222-4222-8222-222222222222";
const workspaceId = "33333333-3333-4333-8333-333333333333";
const otherWorkspaceId = "44444444-4444-4444-8444-444444444444";
const contentItemId = "55555555-5555-4555-8555-555555555555";
const assetId = "66666666-6666-4666-8666-666666666666";
const otherAssetId = "77777777-7777-4777-8777-777777777777";

function storeFor(overrides: Partial<WorkspaceAuthorizationStore> = {}): WorkspaceAuthorizationStore {
  return {
    findMembership: async (memberUserId, memberWorkspaceId) => {
      if (memberUserId !== userId || memberWorkspaceId !== workspaceId) return undefined;
      return { role: "editor" };
    },
    findContentItem: async itemId => itemId === contentItemId ? { id: itemId, workspaceId } : undefined,
    findAsset: async requestedAssetId => {
      if (requestedAssetId === assetId) return { id: requestedAssetId, workspaceId };
      if (requestedAssetId === otherAssetId) return { id: requestedAssetId, workspaceId: otherWorkspaceId };
      return undefined;
    },
    ...overrides,
  };
}

describe("workspace authorization", () => {
  it("authorizes a workspace member and preserves the server-derived role", async () => {
    await expect(requireWorkspaceMember(storeFor(), userId, workspaceId)).resolves.toEqual({
      userId,
      workspaceId,
      role: "editor",
    });
  });

  it("denies unknown members and owner-only operations for editors", async () => {
    await expect(requireWorkspaceMember(storeFor(), otherUserId, workspaceId)).rejects.toMatchObject({
      name: "AuthorizationError",
      status: 403,
    });
    await expect(requireWorkspaceOwner(storeFor(), userId, workspaceId)).rejects.toMatchObject({
      name: "AuthorizationError",
      status: 403,
    });
  });

  it("derives content and asset workspaces from the database records", async () => {
    await expect(requireContentItemAccess(storeFor(), userId, contentItemId)).resolves.toMatchObject({
      contentItemId,
      workspaceId,
      role: "editor",
    });
    await expect(requireAssetAccess(storeFor(), userId, assetId)).resolves.toMatchObject({
      assetId,
      workspaceId,
      role: "editor",
    });
  });

  it("rejects invalid IDs and cross-workspace content-asset links", async () => {
    await expect(requireContentItemAccess(storeFor(), userId, "not-a-uuid")).rejects.toBeInstanceOf(AuthorizationError);
    await expect(requireContentAssetLinkAccess(storeFor(), userId, contentItemId, otherAssetId)).rejects.toMatchObject({
      message: "Content and asset must belong to the same workspace",
      status: 403,
    });
  });

  it("accepts owner access only when the membership record says owner", async () => {
    const ownerStore = storeFor({
      findMembership: async () => ({ role: "owner" }),
    });
    await expect(requireWorkspaceOwner(ownerStore, userId, workspaceId)).resolves.toEqual({
      userId,
      workspaceId,
      role: "owner",
    });
  });
});
