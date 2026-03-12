import { connectDB } from "../../../lib/mongodb";
import Glicemia from "../../../models/Glicemia";

export async function POST(req: Request) {

    await connectDB();

    const body = await req.json();

    const registro = await Glicemia.create(body);

    return Response.json(registro);

}

export async function GET() {

    await connectDB();

    const registros = await Glicemia
        .find()
        .sort({ data: -1 });

    return Response.json(registros);

}