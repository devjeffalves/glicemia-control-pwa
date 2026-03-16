"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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
                    {mostrarSenha ? <FaEyeSlash /> : <FaEye />} 
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
