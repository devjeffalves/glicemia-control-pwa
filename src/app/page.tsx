"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/app/hooks/useRequireAuth";


export default function Home() {
  // Protege a rota de usuários não autenticados
  useRequireAuth();
  useEffect(() => {



    const intervalo = setInterval(() => {

      const agora = new Date();

      const hora = agora.getHours();
      const minuto = agora.getMinutes();

      if (hora === 8 && minuto === 0) {
        mostrarNotificacao();
      }

      if (hora === 14 && minuto === 0) {
        mostrarNotificacao();
      }

      if (hora === 20 && minuto === 0) {
        mostrarNotificacao();
      }

    }, 60000);

    return () => clearInterval(intervalo);

  }, []);


  const pedirPermissaoNotificacao = async () => {

    if (!("Notification" in window)) {
      alert("Este navegador não suporta notificações.");
      return;
    }

    const permissao = await Notification.requestPermission();

    if (permissao === "granted") {
      alert("Notificações ativadas!");
    }

  };

  const mostrarNotificacao = () => {

    if (Notification.permission === "granted") {

      new Notification("Hora de medir sua glicemia ⏰", {
        body: "Registre sua glicemia no aplicativo.",
        icon: "/icon-192.png"
      });

    }

  };
  const { logout, user } = useAuth();




  return (
    <>
      <div className="w-full flex justify-end items-center px-4 py-2 space-x-4 bg-white shadow-sm fixed top-0 right-0 z-20">
        {user?.nome && (
          <span className="text-gray-700">Olá, {user.nome}</span>
        )}
        <button onClick={logout} className="text-red-600">Sair</button>
      </div>

      <main className="flex flex-col items-center justify-center min-h-screen p-6 gap-10 pb-24" style={{ paddingTop: '64px' }}>
        
      <button
        onClick={pedirPermissaoNotificacao}
        className="bg-blue-600 text-white p-4 rounded-xl text-lg"
      >
        Ativar lembretes de glicemia
      </button>

      <h1 className="text-4xl font-bold text-center">
        Controle de Glicemia
      </h1>

      <p className="text-lg text-center max-w-sm">
        Registre sua glicemia diariamente e acompanhe sua evolução.
      </p>

      <div className="flex flex-col gap-6 w-full max-w-xs">

        <Link href="/registro">
          <button className="w-full bg-blue-600 text-white text-2xl p-6 rounded-2xl shadow">
            Registrar Glicemia
          </button>
        </Link>

        <Link href="/historico">
          <button className="w-full bg-green-600 text-white text-2xl p-6 rounded-2xl shadow">
            Ver Histórico
          </button>
        </Link>

      </div>


      </main>
    </>
  );
}
