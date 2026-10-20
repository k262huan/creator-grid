import { NextResponse } from "next/server";

import { AuthenticationError } from "@/lib/auth";
import { AuthorizationError } from "@/lib/authorization";
import { AiLimitExceededError, ContentLimitExceededError } from "@/lib/plans";

export function toApiErrorResponse(error: unknown): NextResponse {
  if (error instanceof AuthenticationError) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (error instanceof AuthorizationError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof AiLimitExceededError || error instanceof ContentLimitExceededError) {
    return NextResponse.json({ error: error.message, limit: error.limit }, { status: error.status });
  }

  console.error("Unhandled API error", error instanceof Error ? error.name : "unknown");
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
