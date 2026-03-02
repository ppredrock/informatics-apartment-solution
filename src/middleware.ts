import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "next-firebase-auth-edge";
import { authConfig } from "@/lib/auth/config";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/verify-email"];

export async function middleware(request: NextRequest) {
  return authMiddleware(request, {
    loginPath: authConfig.loginPath,
    logoutPath: authConfig.logoutPath,
    apiKey: authConfig.apiKey,
    cookieName: authConfig.cookieName,
    cookieSignatureKeys: authConfig.cookieSignatureKeys,
    cookieSerializeOptions: authConfig.cookieSerializeOptions,
    serviceAccount: authConfig.serviceAccount,
    handleValidToken: async ({ token, decodedToken }, headers) => {
      const path = request.nextUrl.pathname;

      // Redirect authenticated users away from auth pages
      if (PUBLIC_PATHS.some((p) => path.startsWith(p))) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      return NextResponse.next({ request: { headers } });
    },
    handleInvalidToken: async (reason) => {
      const path = request.nextUrl.pathname;

      // Allow access to public paths
      if (PUBLIC_PATHS.some((p) => path.startsWith(p))) {
        return NextResponse.next();
      }

      // Allow access to API auth routes
      if (path.startsWith("/api/auth")) {
        return NextResponse.next();
      }

      // Redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    },
    handleError: async (error) => {
      console.error("Auth middleware error:", error);
      return NextResponse.redirect(new URL("/login", request.url));
    },
  });
}

export const config = {
  matcher: [
    "/",
    "/(dashboard|members|finance|gate|notices|complaints|roles|settings|account|gatekeeper)(.*)",
    "/login",
    "/register",
    "/forgot-password",
    "/api/auth/:path*",
  ],
};
