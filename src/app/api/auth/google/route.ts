import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
import UserSession from "@/models/UserSession";
import { generateToken } from "@/lib/auth/auth";

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(req: Request) {
    try {
        await connectMongo();
        const { credential } = await req.json();

        if (!credential) {
            return NextResponse.json({ error: "Token do Google é obrigatório" }, { status: 400 });
        }

        // Verifica o token com o Google
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return NextResponse.json({ error: "Token inválido" }, { status: 400 });
        }

        const { email, name, sub: googleId } = payload;

        // Procura usuário pelo email
        let user = await User.findOne({ email });

        if (!user) {
            // Cria um novo usuário se não existir
            // Senha aleatória pois ele usará o Google
            const randomPassword = Math.random().toString(36).slice(-10);
            user = await User.create({
                nome: name || "Usuário Google",
                email: email,
                password: randomPassword, // Opcional: hash da senha se necessário pelo Schema
                role: "user",
            });
        }

        const token = generateToken(user._id.toString());

        // Registra a sessão
        const userAgent = req.headers.get("user-agent") || "";
        const session = await UserSession.create({
            userId: user._id,
            userName: user.nome,
            userEmail: user.email,
            userAgent,
            status: "active",
        });

        const response = NextResponse.json({ message: "Login realizado com sucesso" });

        const isProd = process.env.NODE_ENV === "production";
        
        // Configura cookies
        response.cookies.set("token", token, {
            path: "/",
            httpOnly: true,
            maxAge: 604800,
            secure: isProd,
            sameSite: "lax",
        });

        response.cookies.set("sid", session._id.toString(), {
            path: "/",
            httpOnly: true,
            maxAge: 604800,
            secure: isProd,
            sameSite: "lax",
        });

        return response;

    } catch (error: any) {
        console.error("Erro no login Google:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}
