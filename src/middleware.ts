import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher(["/app(.*)", "/api(.*)"]);
const isPublicApiRoute = createRouteMatcher(["/api/webhooks/stripe(.*)", "/api/stripe/webhook(.*)"]);
const hasClerkRuntimeConfiguration = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

export default hasClerkRuntimeConfiguration
  ? clerkMiddleware(async (auth, request) => {
      if (isProtectedRoute(request) && !isPublicApiRoute(request)) {
        await auth.protect();
      }
    })
  : (request: NextRequest) => {
      if (isProtectedRoute(request) && !isPublicApiRoute(request)) {
        return NextResponse.json(
          { error: "Authentication service is not configured" },
          { status: 503 },
        );
      }
      return NextResponse.next();
    };

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ico|webp|woff2?|ttf|map|txt|xml|pdf|zip)).*)",
    "/(api|trpc)(.*)",
  ],
};
