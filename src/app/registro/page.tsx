"use client";

import { useState } from "react";

export default function Registro() {

    const [valor, setValor] = useState("");
    const [observacao, setObservacao] = useState("");
    const [mensagem, setMensagem] = useState("");

    const valoresRapidos = [80, 100, 120, 150, 200];

    const salvarRegistro = async () => {

        if (!valor) {
            setMensagem("Informe o valor da glicemia");
            return;
        }

        const response = await fetch("/api/glicemia", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                valor: Number(valor),
                observacao
            })
        });

        if (response.ok) {
            setMensagem("Registro salvo com sucesso!");
            setValor("");
            setObservacao("");
        } else {
            setMensagem("Erro ao salvar registro");
        }
    };

    return (

        <main className="flex flex-col gap-6 p-6 max-w-md mx-auto">

            <h1 className="text-3xl font-bold text-center">
                Registrar Glicemia
            </h1>

            <div className="grid grid-cols-3 gap-3">

                {valoresRapidos.map((v) => (
                    <button
                        key={v}
                        onClick={() => setValor(String(v))}
                        className="bg-gray-200 p-4 rounded-xl text-xl text-black font-bold"
                    >
                        {v}
                    </button>
                ))}

            </div>

            <input
                type="number"
                placeholder="Valor da glicemia"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="border p-4 text-2xl rounded-xl"
            />

            <textarea
                placeholder="Observação (opcional)"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className="border p-4 text-xl rounded-xl"
            />

            <button
                onClick={salvarRegistro}
                className="bg-blue-600 text-white p-5 text-xl rounded-xl"
            >
                Salvar Registro
            </button>

            {mensagem && (
                <p className="text-center text-lg">
                    {mensagem}
                </p>
            )}

        </main>
    );
}