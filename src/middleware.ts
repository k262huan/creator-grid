import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/app(.*)", "/api(.*)"]);
const isPublicApiRoute = createRouteMatcher(["/api/webhooks/stripe(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request) && !isPublicApiRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ico|webp|woff2?|ttf|map|txt|xml|pdf|zip)).*)",
    "/(api|trpc)(.*)",
  ],
};
