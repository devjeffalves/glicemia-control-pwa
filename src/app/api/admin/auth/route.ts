import { NextResponse } from "next/server";

export async function POST(req: Request) {

    const { secret } = await req.json();

    if (!secret || secret !== process.env.ADMIN_SECRET) {
        return NextResponse.json(
            { error: "Segredo incorreto" },
            { status: 401 }
        );
    }

    const isProd = process.env.NODE_ENV === "production";

    const response = NextResponse.json({ ok: true });

    // Cookie de sessão admin válido por 8 horas
    response.headers.set(
        "Set-Cookie",
        `admin_token=${secret}; Path=/; HttpOnly; Max-Age=28800; ${isProd ? 'Secure; ' : ''}SameSite=Lax`
    );

    return response;
}

export async function DELETE(req: Request) {

    const isProd = process.env.NODE_ENV === "production";
    const response = NextResponse.json({ ok: true });

    response.headers.set(
        "Set-Cookie",
        `admin_token=; Path=/; HttpOnly; Max-Age=0; ${isProd ? 'Secure; ' : ''}SameSite=Lax`
    );

    return response;
}
