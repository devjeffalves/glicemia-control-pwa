import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth/auth";
import UserSession from "@/models/UserSession";

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

  // Registra a sessão do usuário para o painel de desenvolvedor
  const userAgent = req.headers.get("user-agent") || "";
  const session = await UserSession.create({
    userId: user._id,
    userName: user.nome,
    userEmail: user.email,
    userAgent,
    status: "active",
  });

  const body = JSON.stringify({ message: "Login realizado" });
  const headers = new Headers();
  headers.set("Content-Type", "application/json");

  // SameSite=Lax permite que o cookie seja enviado em redirecionamentos (compatível com Vercel)
  const isProd = process.env.NODE_ENV === "production";
  const cookie = `token=${token}; Path=/; HttpOnly; Max-Age=604800; ${isProd ? 'Secure; ' : ''}SameSite=Lax`;
  headers.set("Set-Cookie", cookie);

  // Armazena o sessionId em um segundo cookie para rastreamento de logout
  const sessionCookie = `sid=${session._id.toString()}; Path=/; HttpOnly; Max-Age=604800; ${isProd ? 'Secure; ' : ''}SameSite=Lax`;
  headers.append("Set-Cookie", sessionCookie);

  return new Response(body, { status: 200, headers });
}
