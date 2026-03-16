import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {

    const token = req.cookies.get("token")?.value;
    const adminToken = req.cookies.get("admin_token")?.value;

    const { pathname } = req.nextUrl;

    // Rotas protegidas por autenticação de usuário comum
    const protectedRoutes = [
        "/registro",
        "/historico"
    ];

    const isProtected = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (isProtected && !token) {
        return NextResponse.redirect(
            new URL("/login", req.url)
        );
    }

    // Rota do painel de desenvolvedor — protegida por cookie de admin
    if (pathname.startsWith("/dev-painel")) {
        // Permite acesso se tiver o cookie de admin (verificação real fica na API)
        // A página faz a verificação via fetch à API /api/admin/stats
        // Se não tiver cookie, a página mostrará o formulário de login
        return NextResponse.next();
    }

    return NextResponse.next();

}

export const config = {

    matcher: [
        "/registro/:path*",
        "/historico/:path*",
        "/dev-painel/:path*",
        "/dev-painel",
    ]

};