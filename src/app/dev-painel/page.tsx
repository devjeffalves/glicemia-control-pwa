"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */
interface Session {
    _id: string;
    userName: string;
    userEmail: string;
    loginAt: string;
    logoutAt: string | null;
    durationSeconds: number | null;
    status: "active" | "ended" | "expired";
    userAgent: string;
}

interface DayCount {
    _id: string;
    count: number;
}

interface TopUser {
    _id: string;
    name: string;
    email: string;
    total: number;
}

interface Stats {
    totalUsers: number;
    totalGlicemia: number;
    totalSessions: number;
    activeSessions: number;
    avgDurationSeconds: number;
    recentSessions: Session[];
    loginsByDay: DayCount[];
    topUsers: TopUser[];
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */
function formatDuration(secs: number | null): string {
    if (secs === null) return "—";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

function formatDate(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function statusBadge(status: Session["status"]) {
    const map = {
        active: { label: "Ativo", cls: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" },
        ended: { label: "Encerrado", cls: "bg-slate-500/20 text-slate-300 border border-slate-500/30" },
        expired: { label: "Expirado", cls: "bg-amber-500/20 text-amber-300 border border-amber-500/30" },
    };
    const { label, cls } = map[status];
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
            {label}
        </span>
    );
}

/* -------------------------------------------------------------------------- */
/* Stat Card                                                                   */
/* -------------------------------------------------------------------------- */
function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string | number; sub?: string }) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 flex flex-col gap-2 hover:border-white/20 transition-all duration-300">
            <div className="text-3xl">{icon}</div>
            <p className="text-slate-400 text-sm">{label}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            {sub && <p className="text-slate-500 text-xs">{sub}</p>}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Tiny Bar Chart (CSS only)                                                   */
/* -------------------------------------------------------------------------- */
function MiniBarChart({ data }: { data: DayCount[] }) {
    if (!data.length) return <p className="text-slate-500 text-sm">Sem dados</p>;
    const max = Math.max(...data.map(d => d.count), 1);
    return (
        <div className="flex items-end gap-1.5 h-20">
            {data.map(d => (
                <div key={d._id} className="flex flex-col items-center gap-1 flex-1 group">
                    <div
                        className="w-full rounded-t bg-indigo-500/60 group-hover:bg-indigo-400 transition-all"
                        style={{ height: `${(d.count / max) * 100}%`, minHeight: 4 }}
                        title={`${d._id}: ${d.count} logins`}
                    />
                    <span className="text-[9px] text-slate-500 rotate-45 origin-left hidden xl:block">
                        {d._id.slice(5)}
                    </span>
                </div>
            ))}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Login Screen                                                                */
/* -------------------------------------------------------------------------- */
function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
    const [secret, setSecret] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const res = await fetch("/api/admin/auth", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ secret }),
        });
        setLoading(false);
        if (res.ok) {
            onSuccess();
        } else {
            setError("Segredo incorreto. Verifique a variável ADMIN_SECRET.");
        }
    };

    return (
        <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-6">
            <div className="w-full max-w-sm space-y-8">
                {/* Logo / title */}
                <div className="text-center space-y-2">
                    <div className="text-5xl">🔐</div>
                    <h1 className="text-2xl font-bold text-white">Acesso Restrito</h1>
                    <p className="text-slate-400 text-sm">Painel de Desenvolvedor — Controle de Glicemia</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            id="admin-secret-input"
                            type="password"
                            placeholder="Chave de acesso (ADMIN_SECRET)"
                            value={secret}
                            onChange={e => setSecret(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    {error && (
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        id="admin-login-btn"
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
                    >
                        {loading ? "Verificando..." : "Entrar"}
                    </button>
                </form>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Main Dashboard                                                              */
/* -------------------------------------------------------------------------- */
export default function DevPainel() {
    const [isAuthed, setIsAuthed] = useState(false);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<"all" | "active" | "ended" | "expired">("all");
    const [search, setSearch] = useState("");
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/stats", { credentials: "include" });
            if (res.status === 401) {
                setIsAuthed(false);
                return;
            }
            const data = await res.json();
            setStats(data);
            setLastRefresh(new Date());
        } finally {
            setLoading(false);
        }
    }, []);

    // Testa se já tem cookie de admin ao montar
    useEffect(() => {
        (async () => {
            const res = await fetch("/api/admin/stats", { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
                setLastRefresh(new Date());
                setIsAuthed(true);
            }
        })();
    }, []);

    const handleLogout = async () => {
        await fetch("/api/admin/auth", { method: "DELETE", credentials: "include" });
        setIsAuthed(false);
        setStats(null);
    };

    if (!isAuthed) {
        return (
            <AdminLogin
                onSuccess={() => {
                    setIsAuthed(true);
                    fetchStats();
                }}
            />
        );
    }

    /* ---------------------------------------------------------------------- */
    /* Filtered sessions                                                        */
    /* ---------------------------------------------------------------------- */
    const sessions = (stats?.recentSessions ?? []).filter(s => {
        const matchFilter = filter === "all" || s.status === filter;
        const q = search.toLowerCase();
        const matchSearch =
            !q ||
            s.userName.toLowerCase().includes(q) ||
            s.userEmail.toLowerCase().includes(q);
        return matchFilter && matchSearch;
    });

    /* ---------------------------------------------------------------------- */
    /* Render                                                                   */
    /* ---------------------------------------------------------------------- */
    return (
        <div className="min-h-screen bg-[#080c14] text-white">

            {/* ---------------------------------------------------------------- */}
            {/* Top bar                                                           */}
            {/* ---------------------------------------------------------------- */}
            <header className="sticky top-0 z-30 border-b border-white/10 bg-[#080c14]/80 backdrop-blur-lg px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">📊</span>
                    <div>
                        <h1 className="font-bold text-lg leading-none">Dev Painel</h1>
                        <p className="text-slate-500 text-xs">Área restrita — Controle de Glicemia</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Link 
                        href="/"
                        className="text-slate-400 hover:text-white text-sm transition-colors mr-2 hidden sm:block"
                    >
                        ← Voltar ao App
                    </Link>
                    {lastRefresh && (
                        <p className="text-slate-500 text-xs hidden sm:block">
                            Atualizado: {lastRefresh.toLocaleTimeString("pt-BR")}
                        </p>
                    )}
                    <button
                        id="btn-refresh-stats"
                        onClick={fetchStats}
                        disabled={loading}
                        className="bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg text-sm transition-all"
                    >
                        {loading ? "⟳ Carregando..." : "⟳ Atualizar"}
                    </button>
                    <button
                        id="btn-admin-logout"
                        onClick={handleLogout}
                        className="bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-sm transition-all"
                    >
                        Sair
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-16 space-y-8">

                {/* ---------------------------------------------------------------- */}
                {/* Stat Cards                                                        */}
                {/* ---------------------------------------------------------------- */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon="👤"
                        label="Total de Usuários"
                        value={stats?.totalUsers ?? "—"}
                    />
                    <StatCard
                        icon="📋"
                        label="Registros de Glicemia"
                        value={stats?.totalGlicemia ?? "—"}
                    />
                    <StatCard
                        icon="🔗"
                        label="Sessões Totais"
                        value={stats?.totalSessions ?? "—"}
                        sub={`${stats?.activeSessions ?? 0} sessão(ões) ativa(s)`}
                    />
                    <StatCard
                        icon="⏱️"
                        label="Duração Média"
                        value={stats ? formatDuration(stats.avgDurationSeconds) : "—"}
                        sub="por sessão encerrada"
                    />
                </section>

                {/* ---------------------------------------------------------------- */}
                {/* Charts row                                                        */}
                {/* ---------------------------------------------------------------- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Logins por dia */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 space-y-4">
                        <h2 className="font-semibold text-white">Logins — últimos 14 dias</h2>
                        <MiniBarChart data={stats?.loginsByDay ?? []} />
                    </div>

                    {/* Top usuários */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 space-y-4">
                        <h2 className="font-semibold text-white">Top usuários por registros</h2>
                        <div className="space-y-2">
                            {(stats?.topUsers ?? []).slice(0, 5).map((u, i) => (
                                <div key={u._id} className="flex items-center gap-3">
                                    <span className="text-slate-400 text-sm w-5 shrink-0">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">{u.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                                    </div>
                                    <span className="text-indigo-300 font-bold text-sm">{u.total}</span>
                                </div>
                            ))}
                            {(!stats?.topUsers || stats.topUsers.length === 0) && (
                                <p className="text-slate-500 text-sm">Nenhum registro ainda</p>
                            )}
                        </div>
                    </div>

                </div>

                {/* ---------------------------------------------------------------- */}
                {/* Sessions Table                                                    */}
                {/* ---------------------------------------------------------------- */}
                <section className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <h2 className="font-semibold text-white text-lg">
                            Sessões Recentes
                            <span className="ml-2 text-slate-500 font-normal text-sm">
                                ({sessions.length} exibida{sessions.length !== 1 ? "s" : ""})
                            </span>
                        </h2>

                        <div className="flex flex-col sm:flex-row gap-2">
                            {/* Search */}
                            <input
                                id="sessions-search"
                                type="text"
                                placeholder="Buscar usuário..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-48"
                            />

                            {/* Filter buttons */}
                            <div className="flex gap-1.5 bg-white/5 rounded-xl p-1 border border-white/10">
                                {(["all", "active", "ended", "expired"] as const).map(f => (
                                    <button
                                        key={f}
                                        id={`filter-${f}`}
                                        onClick={() => setFilter(f)}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filter === f
                                            ? "bg-indigo-600 text-white"
                                            : "text-slate-400 hover:text-white"
                                            }`}
                                    >
                                        {{
                                            all: "Todos",
                                            active: "Ativos",
                                            ended: "Encerrados",
                                            expired: "Expirados",
                                        }[f]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Table (desktop) / Cards (mobile) */}
                    <div className="rounded-2xl border border-white/10 overflow-hidden">

                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                                        <th className="text-left px-4 py-3 font-medium">Usuário</th>
                                        <th className="text-left px-4 py-3 font-medium">Login</th>
                                        <th className="text-left px-4 py-3 font-medium">Logout</th>
                                        <th className="text-left px-4 py-3 font-medium">Duração</th>
                                        <th className="text-left px-4 py-3 font-medium">Status</th>
                                        <th className="text-left px-4 py-3 font-medium">Dispositivo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {sessions.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center py-8 text-slate-500">
                                                Nenhuma sessão encontrada
                                            </td>
                                        </tr>
                                    )}
                                    {sessions.map(s => (
                                        <tr key={s._id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="text-white font-medium">{s.userName}</p>
                                                <p className="text-slate-500 text-xs">{s.userEmail}</p>
                                            </td>
                                            <td className="px-4 py-3 text-slate-300">{formatDate(s.loginAt)}</td>
                                            <td className="px-4 py-3 text-slate-300">{formatDate(s.logoutAt)}</td>
                                            <td className="px-4 py-3 text-slate-300">{formatDuration(s.durationSeconds)}</td>
                                            <td className="px-4 py-3">{statusBadge(s.status)}</td>
                                            <td className="px-4 py-3">
                                                <p className="text-slate-500 text-xs max-w-[200px] truncate" title={s.userAgent}>
                                                    {s.userAgent
                                                        ? s.userAgent.includes("Mobile") ? "📱 Mobile" : "🖥️ Desktop"
                                                        : "—"}
                                                </p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-white/10">
                            {sessions.length === 0 && (
                                <p className="text-center py-8 text-slate-500 text-sm">Nenhuma sessão encontrada</p>
                            )}
                            {sessions.map(s => (
                                <div key={s._id} className="p-4 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-white font-medium">{s.userName}</p>
                                            <p className="text-slate-500 text-xs">{s.userEmail}</p>
                                        </div>
                                        {statusBadge(s.status)}
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400">
                                        <span>🔑 Login: {formatDate(s.loginAt)}</span>
                                        <span>🚪 Logout: {formatDate(s.logoutAt)}</span>
                                        <span>⏱ Duração: {formatDuration(s.durationSeconds)}</span>
                                        <span>{s.userAgent?.includes("Mobile") ? "📱" : "🖥️"} {s.userAgent?.includes("Mobile") ? "Mobile" : "Desktop"}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </section>

            </main>
        </div>
    );
}
