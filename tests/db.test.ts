import { describe, expect, it } from "vitest";
import { parseDatabaseUrl } from "../src/db";

describe("parseDatabaseUrl", () => {
  it("accepts a TLS-required PostgreSQL URL", () => {
    expect(parseDatabaseUrl("postgresql://user:password@db.example/creator_grid?sslmode=require")).toContain("sslmode=require");
  });

  it("rejects missing, malformed, and non-PostgreSQL URLs without exposing values", () => {
    expect(() => parseDatabaseUrl(undefined)).toThrow("DATABASE_URL");
    expect(() => parseDatabaseUrl("not-a-url")).toThrow("DATABASE_URL");
    expect(() => parseDatabaseUrl("postgresql://user:secret@db.example/creator_grid")).toThrow("DATABASE_URL");
    expect(() => parseDatabaseUrl("postgres://user:secret@db.example/creator_grid?sslmode=require")).not.toThrow();
  });
});
