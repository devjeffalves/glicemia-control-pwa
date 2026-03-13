import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {

    try {

        await connectMongo();

        const { nome, email, password } = await req.json();

        const existingUser = await User.findOne({ email });

        if (existingUser) {

            return NextResponse.json(
                { error: "Email já cadastrado" },
                { status: 400 }
            );

        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({

            nome,
            email,
            password: hashedPassword

        });

        return NextResponse.json({
            message: "Usuário criado com sucesso",
            userId: user._id
        });

    } catch (error) {

        return NextResponse.json(
            { error: "Erro ao criar usuário" },
            { status: 500 }
        );

    }

}