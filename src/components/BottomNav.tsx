"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {

  const pathname = usePathname();

  // Ocultar BottomNav em telas de login, cadastro ou painel dev
  const shouldHide = 
    pathname.startsWith("/login") || 
    pathname.startsWith("/cadastro") || 
    pathname.startsWith("/dev-painel");
  if (shouldHide) return null;

  const active = (path: string) =>
    pathname === path ? "text-blue-600" : "text-gray-500";

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow flex justify-around p-4 text-lg">

            <Link href="/" className={`flex flex-col items-center ${active("/")}`}>
                <span>🏠</span>
                Home
            </Link>

            <Link href="/registro" className={`flex flex-col items-center ${active("/registro")}`}>
                <span>➕</span>
                Registrar
            </Link>

            <Link href="/historico" className={`flex flex-col items-center ${active("/historico")}`}>
                <span>📊</span>
                Histórico
            </Link>

        </nav>
    );
}
