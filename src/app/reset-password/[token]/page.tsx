"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ResetPassword() {
    const router = useRouter();
    const { token } = useParams();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    
    const [message, setMessage] = useState("");
    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setErro("As senhas não coincidem");
            return;
        }

        setErro("");
        setLoading(true);

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Ocorreu um erro");

            setMessage(data.message);
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (err: any) {
            setErro(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex flex-col items-center justify-center min-h-screen p-6">
            <div className="w-full max-w-sm">
                <h1 className="text-3xl font-bold mb-2">Nova senha</h1>
                <p className="text-gray-500 mb-6">Crie uma nova senha para acessar sua conta.</p>

                {message ? (
                    <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl">
                        {message} Redirecionando para o login...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="relative">
                            <input
                                type={mostrarSenha ? "text" : "password"}
                                placeholder="Nova senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="border p-4 rounded-xl w-full"
                                required
                                minLength={6}
                            />
                            <button 
                                type="button" 
                                onClick={() => setMostrarSenha(!mostrarSenha)} 
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
                            >
                                {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        <input
                            type={mostrarSenha ? "text" : "password"}
                            placeholder="Confirme a nova senha"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="border p-4 rounded-xl"
                            required
                        />

                        {erro && <p className="text-red-600 font-medium">{erro}</p>}

                        <button
                            disabled={loading}
                            className="bg-green-600 text-white p-4 rounded-xl font-semibold disabled:opacity-50"
                        >
                            {loading ? "Salvando..." : "Redefinir Senha"}
                        </button>
                    </form>
                )}
            </div>
        </main>
    );
}
