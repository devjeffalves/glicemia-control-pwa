import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request) {

    try {

        await connectMongo();

        const cookie = req.headers.get("cookie");

        if (!cookie) {

            return NextResponse.json(
                { error: "Não autenticado" },
                { status: 401 }
            );

        }

        const token = cookie
            .split(";")
            .find(c => c.trim().startsWith("token="))
            ?.split("=")[1];

        if (!token) {

            return NextResponse.json(
                { error: "Token não encontrado" },
                { status: 401 }
            );

        }

        const decoded: any = jwt.verify(
            token,
            process.env.JWT_SECRET!
        );

        const user = await User.findById(decoded.userId)
            .select("-password");

        if (!user) {

            return NextResponse.json(
                { error: "Usuário não encontrado" },
                { status: 404 }
            );

        }

        return NextResponse.json(user);

    } catch (error) {

        return NextResponse.json(
            { error: "Token inválido" },
            { status: 401 }
        );

    }

}