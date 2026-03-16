import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
import UserSession from "@/models/UserSession";
import Glicemia from "@/models/Glicemia";

// Verifica se a requisição possui autorização de admin
function isAdminAuthorized(req: Request): boolean {
    const cookie = req.headers.get("cookie") || "";
    const adminToken = cookie
        .split(";")
        .find(c => c.trim().startsWith("admin_token="))
        ?.split("=")?.[1]
        ?.trim();
    return adminToken === process.env.ADMIN_SECRET;
}

export async function GET(req: Request) {

    if (!isAdminAuthorized(req)) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    await connectMongo();

    // --- Totais gerais ---
    const totalUsers = await User.countDocuments();
    const totalGlicemia = await Glicemia.countDocuments();

    // --- Sessões ---
    const totalSessions = await UserSession.countDocuments();
    const activeSessions = await UserSession.countDocuments({ status: "active" });

    // Sessões ativas que não tiveram atividade há mais de 7 dias = provavelmente expiradas
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await UserSession.updateMany(
        { status: "active", loginAt: { $lt: sevenDaysAgo } },
        { status: "expired" }
    );

    // --- Duração média das sessões encerradas ---
    const durationAgg = await UserSession.aggregate([
        { $match: { status: "ended", durationSeconds: { $ne: null } } },
        { $group: { _id: null, avg: { $avg: "$durationSeconds" } } }
    ]);
    const avgDurationSeconds = durationAgg[0]?.avg ?? 0;

    // --- Últimas 50 sessões ---
    const recentSessions = await UserSession.find()
        .sort({ loginAt: -1 })
        .limit(50)
        .lean();

    // --- Logins por dia (últimos 14 dias) ---
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const loginsByDay = await UserSession.aggregate([
        { $match: { loginAt: { $gte: fourteenDaysAgo } } },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$loginAt" }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // --- Usuários com mais registros ---
    const topUsers = await Glicemia.aggregate([
        { $group: { _id: "$userId", total: { $sum: 1 } } },
        { $sort: { total: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user"
            }
        },
        { $unwind: "$user" },
        { $project: { name: "$user.nome", email: "$user.email", total: 1 } }
    ]);

    return NextResponse.json({
        totalUsers,
        totalGlicemia,
        totalSessions,
        activeSessions,
        avgDurationSeconds: Math.round(avgDurationSeconds),
        recentSessions,
        loginsByDay,
        topUsers,
    });
}
