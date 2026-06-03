import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "./lib/session";

const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/medico", "/hospitals", "/sem-acesso"];

const ROLE_ALLOWED_PREFIXES: Record<string, string[]> = {
    DOCTOR:  ["/dashboard", "/medico"],
    NURSE:   ["/dashboard","/sem-acesso", "/nurse", ],
    ADMIN:   ["/admin", "/hospitals"],
    MANAGER: ["/admin", "/hospitals"],
};

/** Returns true if the pathname is under one of the protected prefixes. */
function isProtectedRoute(pathname: string): boolean {
    if (PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true;
    // Dynamic hospital routes: /123/dashboard, /123/...
    if (/^\/\d+\//.test(pathname)) return true;
    return false;
}

/** Returns the home route for an authenticated user based on their role. */
function resolveHomeForRole(role: unknown): string {
    const roleMap: Record<string, string> = {
        DOCTOR:  "/medico",
        NURSE:   "/nurse/hospitais",
        ADMIN:   "/admin",
        MANAGER: "/admin",
    };
    return roleMap[role as string] ?? "/login";
}

/**
 * Returns true if the given role is allowed to access the given pathname.
 * Fails closed for unknown roles.
 */
function isRoleAllowed(role: unknown, pathname: string): boolean {
    // Dynamic hospital routes (e.g., /1/dashboard) — accessible to all staff roles
    if (/^\/\d+\//.test(pathname)) {
        return ["DOCTOR", "NURSE", "MANAGER", "ADMIN"].includes(role as string);
    }
    const allowedPrefixes = ROLE_ALLOWED_PREFIXES[role as string];
    if (!allowedPrefixes) return false;
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
