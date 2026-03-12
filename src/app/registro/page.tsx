"use client";

import { useState } from "react";

export default function Registro() {

    const [valor, setValor] = useState("");
    const [observacao, setObservacao] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [gravando, setGravando] = useState(false);

    const observacoesRapidas = [
        "Em jejum",
        "2h após almoço",
        "À noite"
    ];
    const iniciarReconhecimento = () => {

        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Seu navegador não suporta reconhecimento de voz");
            return;
        }

        const recognition = new SpeechRecognition();

        recognition.lang = "pt-BR";
        recognition.continuous = false;

        setGravando(true);

        recognition.start();

        recognition.onresult = (event: any) => {

            const texto = event.results[0][0].transcript.toLowerCase();

            console.log("Você disse:", texto);

            interpretarTexto(texto);

            setGravando(false);

        };

        recognition.onerror = () => {
            setGravando(false);
        };

    };

    const interpretarTexto = (texto: string) => {

        const numero = texto.match(/\d+/);

        if (numero) {
            setValor(numero[0]);;
        }

        if (texto.includes("jejum")) {
            setObservacao("Em jejum");
        }

        if (texto.includes("almoço")) {
            setObservacao("2h após almoço");
        }

        if (texto.includes("noite")) {
            setObservacao("À noite");
        }

    };

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

        <main className="flex flex-col gap-6 p-6 max-w-md mx-auto pb-28">

            <h1 className="text-3xl font-bold text-center">
                Registrar Glicemia
            </h1>

            <input
                type="number"
                placeholder="Valor da glicemia"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="border p-4 text-2xl rounded-xl"
            />
            <button
                onClick={iniciarReconhecimento}
                className={`p-4 rounded-xl text-white text-lg ${gravando ? "bg-red-600" : "bg-purple-600"
                    }`}
            >

                {gravando ? "🎤 Ouvindo..." : "🎤 Registrar por voz"}

            </button>
            <div className="grid grid-cols-2 gap-3">

                {observacoesRapidas.map((obs) => (
                    <button
                        key={obs}
                        onClick={() => setObservacao(obs)}
                        className="bg-gray-200 p-4 text-black rounded-xl text-lg"
                    >
                        {obs}
                    </button>
                ))}

            </div>

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