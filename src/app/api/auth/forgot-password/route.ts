import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { sendEmail } from "@/lib/mail";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "E-mail é obrigatório" }, { status: 400 });
        }

        const user = await User.findOne({ email });

        if (!user) {
            // Por segurança, não confirmamos que o e-mail não existe
            return NextResponse.json({ message: "Se este e-mail estiver cadastrado, você receberá um link de recuperação." });
        }

        // Gera um token aleatório
        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 3600000); // 1 hora de validade

        user.resetPasswordToken = token;
        user.resetPasswordExpires = expires;
        await user.save();

        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`;

        const subject = "Recuperação de Senha - Controle de Glicemia";
        const text = `Você solicitou a recuperação de senha. Clique no link para redefinir: ${resetUrl}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3b82f6;">Recuperação de Senha</h2>
                <p>Olá, ${user.nome}!</p>
                <p>Você solicitou a redefinição de sua senha para o Controle de Glicemia.</p>
                <p>Clique no botão abaixo para criar uma nova senha. Este link expira em 1 hora.</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Redefinir Senha</a>
                <p>Se você não solicitou isso, por favor ignore este e-mail.</p>
            </div>
        `;

        await sendEmail(email, subject, text, html);

        return NextResponse.json({ message: "Se este e-mail estiver cadastrado, você receberá um link de recuperação." });
    } catch (error: any) {
        console.error("Erro no forgot-password:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}
