import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "./lib/session";

/**
 * Routes that require authentication.
 * Any pathname starting with these prefixes is considered protected.
 */
const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/medico"];

/**
 * RBAC rules: maps each StaffRole to the routes it is allowed to access.
 * If a role is not listed, it falls back to its home route.
 *
 * Rules are evaluated as prefix matches (startsWith).
 */
const ROLE_ALLOWED_PREFIXES: Record<string, string[]> = {
    DOCTOR: ["/dashboard", "/medico"],
    NURSE: ["/dashboard"],
    ADMIN: ["/admin"],
    MANAGER: ["/admin"],
};

/** Returns true if the pathname is under one of the protected prefixes. */
function isProtectedRoute(pathname: string): boolean {
    return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** Returns the home route for an authenticated user based on their role. */
function resolveHomeForRole(role: unknown): string {
    const roleMap: Record<string, string> = {
        DOCTOR: "/dashboard",
        NURSE: "/dashboard",
        ADMIN: "/admin",
        MANAGER: "/admin",
    };
    return roleMap[role as string] ?? "/dashboard";
}

/**
 * Returns true if the given role is allowed to access the given pathname.
 * Defaults to allowing access if the role is not found in the RBAC map.
 */
function isRoleAllowed(role: unknown, pathname: string): boolean {
    const allowedPrefixes = ROLE_ALLOWED_PREFIXES[role as string];
    if (!allowedPrefixes) return false; // Unknown role: deny (fail-closed for security)
    return allowedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const isLoginRoute = pathname === "/login";
    const isRegisterRoute = pathname === "/register";

    const session = req.cookies.get("session")?.value;
    const payload = await verifySession(session);

    // --- Unauthenticated access to protected route → redirect to login
    if (isProtectedRoute(pathname) && !payload) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    // --- Authenticated user visiting login/register → redirect to their home
    if ((isLoginRoute || isRegisterRoute) && payload) {
        const home = resolveHomeForRole(payload.role);
        return NextResponse.redirect(new URL(home, req.nextUrl));
    }

    // --- RBAC: authenticated user trying to access a route outside their role
    if (isProtectedRoute(pathname) && payload) {
        if (!isRoleAllowed(payload.role, pathname)) {
            const home = resolveHomeForRole(payload.role);
            return NextResponse.redirect(new URL(home, req.nextUrl));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.ico$).*)"],
};
