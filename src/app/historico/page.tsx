"use client";

import { useEffect, useState } from "react";
import GraficoGlicemia from "../../components/GraficoGlicemia";
import jsPDF from "jspdf";

interface Registro {
    _id: string;
    valor: number;
    observacao?: string;
    data: string;
}

export default function Historico() {

    const [registros, setRegistros] = useState<Registro[]>([]);
    const [mesSelecionado, setMesSelecionado] = useState("");
    const [periodoSelecionado, setPeriodoSelecionado] = useState("");

    useEffect(() => {
        carregarRegistros();
    }, []);

    const carregarRegistros = async () => {

        const response = await fetch("/api/glicemia");
        const data = await response.json();

        setRegistros(data);

    };

    // FILTROS

    const registrosFiltrados = registros.filter((registro) => {

        const data = new Date(registro.data);
        const mesRegistro = data.getMonth() + 1;

        const filtroMes =
            !mesSelecionado || mesRegistro === Number(mesSelecionado);

        const filtroPeriodo =
            !periodoSelecionado ||
            registro.observacao === periodoSelecionado;

        return filtroMes && filtroPeriodo;

    });

    // CORES DA GLICEMIA

    const corGlicemia = (valor: number) => {

        if (valor < 140) return "text-green-600";
        if (valor < 180) return "text-yellow-600";
        return "text-red-600";

    };

    // DATA E HORA

    const formatarDataHora = (data: string) => {

        const d = new Date(data);

        const dataFormatada = d.toLocaleDateString("pt-BR");

        const horaFormatada = d.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        });

        return `${dataFormatada} - ${horaFormatada}`;
    };

    // EXPORTAR PDF

    const exportarPDF = () => {

        const doc = new jsPDF();

        const valores = registrosFiltrados.map(r => r.valor);

        const media =
            valores.reduce((a, b) => a + b, 0) / (valores.length || 1);

        const max = Math.max(...valores);
        const min = Math.min(...valores);

        doc.setFontSize(18);
        doc.text("Relatório de Glicemia", 20, 20);

        doc.setFontSize(12);
        doc.text(
            `Gerado em: ${new Date().toLocaleDateString("pt-BR")}`,
            20,
            28
        );

        doc.text(`Média: ${media.toFixed(1)}`, 20, 40);
        doc.text(`Máxima: ${max}`, 70, 40);
        doc.text(`Mínima: ${min}`, 120, 40);

        doc.setFontSize(14);
        doc.text("Registros", 20, 60);

        doc.setFontSize(11);

        doc.text("Nº", 20, 70);
        doc.text("Data", 30, 70);
        doc.text("Hora", 65, 70);
        doc.text("Valor", 90, 70);
        doc.text("Observação", 120, 70);

        let y = 80;

        registrosFiltrados.forEach((registro, index) => {

            const data = new Date(registro.data);

            const dataFormatada = data.toLocaleDateString("pt-BR");

            const hora = data.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit"
            });

            if (y > 270) {
                doc.addPage();
                y = 20;
            }

            doc.text(String(index + 1), 20, y);
            doc.text(dataFormatada, 30, y);
            doc.text(hora, 65, y);
            doc.text(String(registro.valor), 90, y);
            doc.text(registro.observacao || "-", 120, y);

            y += 10;

        });

        doc.setFontSize(9);
        doc.text(
            "Sistema de Controle de Glicemia",
            20,
            290
        );

        doc.save("relatorio-glicemia.pdf");
    };

    // COMPARTILHAR PDF

    const compartilharPDF = async () => {

        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Relatório de Glicemia", 20, 20);

        let y = 40;

        registrosFiltrados.forEach((registro) => {

            const data = new Date(registro.data);

            const dataFormatada = data.toLocaleDateString("pt-BR");

            const hora = data.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit"
            });

            const linha =
                `${dataFormatada} ${hora} - ${registro.valor} - ${registro.observacao || ""}`;

            doc.text(linha, 20, y);

            y += 10;

        });

        const blob = doc.output("blob");

        const file = new File([blob], "relatorio-glicemia.pdf", {
            type: "application/pdf"
        });

        if (navigator.share && navigator.canShare?.({ files: [file] })) {

            await navigator.share({
                title: "Relatório de Glicemia",
                text: "Compartilhando relatório de glicemia",
                files: [file]
            });

        } else {

            doc.save("relatorio-glicemia.pdf");

            alert("Seu dispositivo não suporta compartilhamento direto. O PDF foi baixado.");

        }

    };

    return (

        <main className="flex flex-col gap-6 p-6 max-w-md mx-auto pb-28">

            <h1 className="text-3xl font-bold text-center">
                Histórico de Glicemia
            </h1>

            {/* FILTROS */}

            <div className="flex flex-col gap-3">

                <select
                    value={mesSelecionado}
                    onChange={(e) => setMesSelecionado(e.target.value)}
                    className="border p-3 bg-gray-400 rounded-xl"
                >
                    <option value="">Todos os meses</option>
                    <option value="1">Janeiro</option>
                    <option value="2">Fevereiro</option>
                    <option value="3">Março</option>
                    <option value="4">Abril</option>
                    <option value="5">Maio</option>
                    <option value="6">Junho</option>
                    <option value="7">Julho</option>
                    <option value="8">Agosto</option>
                    <option value="9">Setembro</option>
                    <option value="10">Outubro</option>
                    <option value="11">Novembro</option>
                    <option value="12">Dezembro</option>
                </select>

                <select
                    value={periodoSelecionado}
                    onChange={(e) => setPeriodoSelecionado(e.target.value)}
                    className="border p-3 bg-gray-400 rounded-xl"
                >
                    <option value="">Todos os períodos</option>
                    <option value="Em jejum">Em jejum</option>
                    <option value="2h após almoço">2h após almoço</option>
                    <option value="À noite">À noite</option>
                </select>

            </div>

            {/* GRÁFICO */}

            {registros.length > 0 && (
                <GraficoGlicemia registros={registrosFiltrados} />
            )}

            {registros.length === 0 && (
                <p className="text-center text-lg">
                    Nenhum registro encontrado
                </p>
            )}

            {/* LISTA */}

            {registrosFiltrados.map((registro) => (
                <div
                    key={registro._id}
                    className="border p-4 rounded-xl flex flex-col gap-2"
                >

                    <div className="flex justify-between items-center">

                        <span className="text-sm  text-gray-700 font-medium">
                            {formatarDataHora(registro.data)}
                        </span>

                        <span className={`text-2xl font-bold ${corGlicemia(registro.valor)}`}>
                            {registro.valor}
                        </span>

                    </div>

                    {registro.observacao && (
                        <p className="text-gray-700">
                            {registro.observacao}
                        </p>
                    )}

                </div>
            ))}

            {/* BOTÕES */}

            <button
                onClick={exportarPDF}
                className="bg-blue-600 text-white p-4 rounded-xl"
            >
                Exportar PDF
            </button>

            <button
                onClick={compartilharPDF}
                className="bg-green-600 text-white p-4 rounded-xl"
            >
                Compartilhar
            </button>

        </main>

    );
}