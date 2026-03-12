"use client";

import { useEffect, useState } from "react";

interface Registro {
    _id: string;
    valor: number;
    observacao?: string;
    data: string;
}

export default function Historico() {

    const [registros, setRegistros] = useState<Registro[]>([]);

    useEffect(() => {
        carregarRegistros();
    }, []);

    const carregarRegistros = async () => {

        const response = await fetch("/api/glicemia");
        const data = await response.json();

        setRegistros(data);

    };

    const corGlicemia = (valor: number) => {

        if (valor < 120) return "text-green-600";
        if (valor < 160) return "text-yellow-600";
        return "text-red-600";

    };

    const formatarData = (data: string) => {

        return new Date(data).toLocaleDateString("pt-BR");

    };

    return (

        <main className="flex flex-col gap-6 p-6 max-w-md mx-auto">

            <h1 className="text-3xl font-bold text-center">
                Histórico de Glicemia
            </h1>

            {registros.length === 0 && (
                <p className="text-center text-lg">
                    Nenhum registro encontrado
                </p>
            )}

            {registros.map((registro) => (
                <div
                    key={registro._id}
                    className="border p-4 rounded-xl flex flex-col gap-2"
                >

                    <div className="flex justify-between items-center">

                        <span className="text-lg">
                            {formatarData(registro.data)}
                        </span>

                        <span className={`text-2xl font-bold ${corGlicemia(registro.valor)}`}>
                            {registro.valor}
                        </span>

                    </div>

                    {registro.observacao && (
                        <p className="text-gray-600">
                            {registro.observacao}
                        </p>
                    )}

                </div>
            ))}

        </main>

    );
}