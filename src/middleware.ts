import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {

    const token = req.cookies.get("token")?.value;

    const { pathname } = req.nextUrl;

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

    return NextResponse.next();

}

export const config = {

    matcher: [
        "/registro/:path*",
        "/historico/:path*"
    ]

};