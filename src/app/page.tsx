import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 gap-10">

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
  );
}