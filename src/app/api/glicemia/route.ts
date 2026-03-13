import connectMongo from "@/lib/mongodb";
import Glicemia from "@/models/Glicemia";
import { getUserFromToken } from "@/lib/getUserFromToken";

export async function POST(req: Request) {

    await connectMongo();

    const userId = getUserFromToken(req);

    if (!userId) {

        return Response.json(
            { error: "Não autorizado" },
            { status: 401 }
        );

    }

    const body = await req.json();

    const { valor, data, observacao } = body;

    const registro = await Glicemia.create({

        userId,
        valor,
        data,
        observacao

    });

    return Response.json(registro);

}

export async function GET(req: Request) {

    await connectMongo();

    const userId = getUserFromToken(req);

    if (!userId) {

        return Response.json(
            { error: "Não autorizado" },
            { status: 401 }
        );

    }

    const registros = await Glicemia
        .find({ userId })
        .sort({ data: -1 });

    return Response.json(registros);

}