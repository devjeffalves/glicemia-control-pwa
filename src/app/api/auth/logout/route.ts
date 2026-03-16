import connectMongo from "@/lib/mongodb";
import UserSession from "@/models/UserSession";

export async function POST(req: Request) {

    const isProd = process.env.NODE_ENV === "production";

    // Recupera o ID da sessão do cookie para fechar a sessão no banco
    const cookieHeader = req.headers.get("cookie") || "";
    const sidMatch = cookieHeader
        .split(";")
        .find(c => c.trim().startsWith("sid="));
    const sessionId = sidMatch?.split("=")?.[1]?.trim();

    if (sessionId) {
        try {
            await connectMongo();

            const session = await UserSession.findById(sessionId);
            if (session && session.status === "active") {
                const logoutAt = new Date();
                const durationSeconds = Math.round(
                    (logoutAt.getTime() - new Date(session.loginAt).getTime()) / 1000
                );
                await UserSession.findByIdAndUpdate(sessionId, {
                    logoutAt,
                    durationSeconds,
                    status: "ended",
                });
            }
        } catch {
            // Não bloqueia o logout se a sessão não for encontrada
        }
    }

    const response = Response.json({
        message: "Logout realizado"
    });

    // Expira o token JWT
    response.headers.set(
        "Set-Cookie",
        `token=; Path=/; HttpOnly; Max-Age=0; ${isProd ? 'Secure; ' : ''}SameSite=Lax`
    );

    // Expira o cookie de sessão
    response.headers.append(
        "Set-Cookie",
        `sid=; Path=/; HttpOnly; Max-Age=0; ${isProd ? 'Secure; ' : ''}SameSite=Lax`
    );

    return response;

}