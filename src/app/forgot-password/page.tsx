"use client";

import { useState } from "react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setErro("");
        setMessage("");
        setLoading(true);

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Ocorreu um erro");

            setMessage(data.message);
        } catch (err: any) {
            setErro(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex flex-col items-center justify-center min-h-screen p-6">
            <div className="w-full max-w-sm">
                <Link href="/login" className="flex items-center gap-2 text-gray-500 mb-8 hover:text-black transition-colors">
                    <FaArrowLeft /> Voltar para o login
                </Link>

                <h1 className="text-3xl font-bold mb-2">Recuperar senha</h1>
                <p className="text-gray-500 mb-6">Insira seu e-mail para receber um link de redefinição.</p>

                {message ? (
                    <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-4">
                        {message}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                            type="email"
                            placeholder="Seu e-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border p-4 rounded-xl"
                            required
                        />

                        {erro && <p className="text-red-600">{erro}</p>}

                        <button
                            disabled={loading}
                            className="bg-blue-600 text-white p-4 rounded-xl font-semibold disabled:opacity-50"
                        >
                            {loading ? "Enviando..." : "Enviar link de recuperação"}
                        </button>
                    </form>
                )}
            </div>
        </main>
    );
}
