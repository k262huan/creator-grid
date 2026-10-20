import { describe, expect, it } from "vitest";

import { assertValidStatusTransition, canTransitionContent, contentInputSchema } from "@/lib/content";

describe("content contracts", () => {
  it("allows the forward production workflow and archive recovery", () => {
    expect(canTransitionContent("idea", "planned")).toBe(true);
    expect(canTransitionContent("planned", "in_production")).toBe(true);
    expect(canTransitionContent("in_review", "approved")).toBe(true);
    expect(canTransitionContent("published", "idea")).toBe(false);
    expect(canTransitionContent("archived", "idea")).toBe(true);
  });

  it("rejects invalid status transitions", () => {
    expect(() => assertValidStatusTransition("published", "in_production")).toThrow("Invalid content status transition");
    expect(() => assertValidStatusTransition("unknown", "idea")).toThrow("Invalid content status transition");
  });

  it("validates required fields and supported content types", () => {
    expect(contentInputSchema.safeParse({ title: "A useful idea", contentType: "video" }).success).toBe(true);
    expect(contentInputSchema.safeParse({ title: "", contentType: "video" }).success).toBe(false);
    expect(contentInputSchema.safeParse({ title: "Idea", contentType: "unsupported" }).success).toBe(false);
  });
});
