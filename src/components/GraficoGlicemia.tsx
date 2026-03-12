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

    const labels = registros.map((r) =>
        new Date(r.data).toLocaleDateString("pt-BR")
    );

    const valores = registros.map((r) => r.valor);

    const data = {
        labels,
        datasets: [
            {
                label: "Glicemia",
                data: valores,
                borderColor: "rgb(59,130,246)",
                backgroundColor: "rgba(59,130,246,0.5)"
            }
        ]
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow">
            <Line data={data} />
        </div>
    );
}