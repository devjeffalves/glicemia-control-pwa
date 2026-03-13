import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth/auth";

export async function POST(req: Request) {
  await connectMongo();

  const { email, password } = await req.json();

  const user = await User.findOne({ email });

  if (!user) {
    return new Response(
      JSON.stringify({ error: "Usuário não encontrado" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return new Response(
      JSON.stringify({ error: "Senha inválida" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const token = generateToken(user._id.toString());

  const body = JSON.stringify({ message: "Login realizado" });
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Set-Cookie", `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict`);

  return new Response(body, { status: 200, headers });
}
