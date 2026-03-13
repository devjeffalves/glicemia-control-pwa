"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// Inline SVG icons as fallback (replaceable with react-icons if installed)
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="mostrar">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeSlashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="ocultar">
    <path d="M3 3l18 18" />
    <path d="M1 12s4-7 11-7c3 0 5 1 7 3" />
    <path d="M10.58 10.59a3 3 0 0 0 4.83 3.28" />
  </svg>
);

export default function Cadastro() {

    const router = useRouter();

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);

    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState("");

    const handleSubmit = async (e: any) => {

        e.preventDefault();

        setErro("");
        setLoading(true);

        const response = await fetch("/api/auth/register", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                nome,
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

        alert("Cadastro realizado com sucesso!");

        router.push("/login");

    };

    return (

        <main className="flex flex-col items-center justify-center min-h-screen p-6">

            <h1 className="text-3xl font-bold mb-6">
                Criar Conta
            </h1>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 w-full max-w-sm"
            >

                <input
                    type="text"
                    placeholder="Nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="border p-4 rounded-xl"
                    required
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-4 rounded-xl"
                    required
                />

                <div className="relative w-full">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-4 rounded-xl w-full"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    aria-label="Mostrar senha"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 p-1"
                  >
                    {mostrarSenha ? <EyeSlashIcon /> : <EyeIcon />}
                  </button>
                </div>

                {erro && (
                    <p className="text-red-600">{erro}</p>
                )}

                <button
                    disabled={loading}
                    className="bg-blue-600 text-white p-4 rounded-xl"
                >
                    {loading ? "Criando conta..." : "Cadastrar"}
                </button>

            </form>

            <p className="mt-4">

                Já possui conta?

                <Link
                    href="/login"
                    className="text-blue-600 ml-2"
                >
                    Entrar
                </Link>

            </p>

        </main>

    );
}
