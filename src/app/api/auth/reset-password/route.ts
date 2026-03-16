import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: "Token e senha são obrigatórios" }, { status: 400 });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 });
        }

        // Hash da nova senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        return NextResponse.json({ message: "Senha redefinida com sucesso!" });
    } catch (error: any) {
        console.error("Erro no reset-password:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}
