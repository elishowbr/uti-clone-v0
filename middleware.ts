import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "./lib/session";

export async function middleware(req: NextRequest) {
    // Rotas protegidas (tudo dentro de /dashboard)
    const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard");
    const isPublicRoute = req.nextUrl.pathname === "/login";

    // Ler o cookie de sessão
    const session = req.cookies.get("session")?.value;

    // Decodificar a sessão
    const payload = await verifySession(session);

    // Redirecionar para login se for rota protegida e não tiver sessão válida
    if (isProtectedRoute && !payload) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    // Redirecionar para dashboard se já estiver logado e tentar acessar o login
    if (isPublicRoute && payload) {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }

    return NextResponse.next();
}

// Configurar matcher para quais rotas o middleware deve rodar
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
