import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { AuthenticationError } from "../src/lib/auth";
import { AuthorizationError } from "../src/lib/authorization";
import { toApiErrorResponse } from "../src/lib/api-errors";

const rlsMigration = readFileSync("src/db/migrations/0001_workspace_rls.sql", "utf8");

describe("security contracts", () => {
  it("maps authentication and authorization failures to safe responses", async () => {
    const unauthenticated = toApiErrorResponse(new AuthenticationError());
    expect(unauthenticated.status).toBe(401);
    expect(await unauthenticated.json()).toEqual({ error: "Authentication required" });

    const unauthorized = toApiErrorResponse(new AuthorizationError("Workspace access denied", 403));
    expect(unauthorized.status).toBe(403);
    expect(await unauthorized.json()).toEqual({ error: "Workspace access denied" });
  });

  it("does not expose unexpected error details", async () => {
    const response = toApiErrorResponse(new Error("database password leaked"));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Internal server error" });
  });

  it("contains RLS, same-workspace association, and owner-delete policies", () => {
    expect(rlsMigration).toContain("ALTER TABLE content_assets ENABLE ROW LEVEL SECURITY");
    expect(rlsMigration).toContain("CREATE POLICY content_assets_member_insert");
    expect(rlsMigration).toContain("EXISTS (SELECT 1 FROM content_items");
    expect(rlsMigration).toContain("EXISTS (SELECT 1 FROM assets");
    expect(rlsMigration).toContain("role = 'owner'");
  });
});
