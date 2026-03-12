"use client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
);

interface Registro {
    _id: string;
    valor: number;
    data: string;
}

export default function GraficoGlicemia({ registros }: { registros: Registro[] }) {

    const registrosOrdenados = [...registros].sort(
        (a, b) =>
            new Date(a.data).getTime() - new Date(b.data).getTime()
    );

    const labels = registrosOrdenados.map((r) =>
        new Date(r.data).toLocaleDateString("pt-BR")
    );

    const valores = registrosOrdenados.map((r) => r.valor);

    const data = {
        labels,
        datasets: [
            {
                label: "Glicemia",
                data: valores,
                borderColor: "rgb(59,130,246)",
                backgroundColor: "rgba(59,130,246,0.3)",
                tension: 0.4
            }
        ]
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow">
            <Line data={data} />
        </div>
    );
}