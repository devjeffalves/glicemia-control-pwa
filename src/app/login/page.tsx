"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

import { FaEye, FaEyeSlash } from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {

    const router = useRouter();
    const { refreshUser } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);

    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: any) => {

        e.preventDefault();

        setErro("");
        setLoading(true);

        const response = await fetch("/api/auth/login", {

            method: "POST",

            credentials: "include", // garante envio/recebimento do cookie HttpOnly em produção

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })

        });

        const data = await response.json();

        setLoading(false);

        if (!response.ok) {
            setErro(data.error);
            return;
        }

        // Atualiza o estado de autenticação e redireciona para a home
        await refreshUser();
        router.push("/");

    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential: credentialResponse.credential }),
            });

            if (res.ok) {
                await refreshUser();
                router.push("/");
            } else {
                const data = await res.json();
                setErro(data.error || "Erro ao entrar com Google");
            }
        } catch (error) {
            setErro("Erro de conexão");
        } finally {
            setLoading(false);
        }
    };

    return (

        <main className="flex flex-col items-center justify-center min-h-screen p-6">

            <h1 className="text-3xl font-bold mb-6 text-center">
                Entrar no <br /> Controle de Glicemia
            </h1>

            <div className="mb-8 w-full flex justify-center">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setErro("Falha no login com Google")}
                    useOneTap
                    theme="filled_blue"
                    shape="pill"
                />
            </div>

            <div className="flex items-center gap-2 w-full max-w-sm mb-6">
                <hr className="flex-1 border-gray-300" />
                <span className="text-gray-400 text-sm">ou entrar com e-mail</span>
                <hr className="flex-1 border-gray-300" />
            </div>

            <form
                onSubmit={handleLogin}
                className="flex flex-col gap-4 w-full max-w-sm"
            >

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-4 rounded-xl"
                    required
                />

                <div className="relative">
                    <input
                        type={mostrarSenha ? "text" : "password"}
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border p-4 rounded-xl w-full"
                        required
                    />
                    <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} aria-label="Mostrar senha" className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                        {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>

                {erro && (
                    <p className="text-red-600">{erro}</p>
                )}

                <button
                    disabled={loading}
                    className="bg-green-600 text-white p-4 rounded-xl"
                >
                    {loading ? "Entrando..." : "Entrar"}
                </button>

                <div className="flex justify-center mt-2">
                    <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                        Esqueci minha senha
                    </Link>
                </div>

            </form>

            <p className="mt-4">

                Não possui conta?

                <Link
                    href="/cadastro"
                    className="text-blue-600 ml-2"
                >
                    Criar conta
                </Link>

            </p>

        </main>

    );
}
