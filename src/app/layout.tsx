import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BottomNav from "../components/BottomNav";
import { AuthProvider } from "@/context/AuthContext";
import GoogleAuthProviderWrapper from "@/components/GoogleAuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Controle de Glicemia",
  description: "App para monitoramento de glicemia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (

    <html lang="pt-BR">

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >

        <GoogleAuthProviderWrapper>
          <AuthProvider>

            {children}

            <BottomNav />

          </AuthProvider>
        </GoogleAuthProviderWrapper>

      </body>

    </html>

  );

}
