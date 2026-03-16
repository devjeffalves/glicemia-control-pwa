"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Redirects to login if the user is not authenticated
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    // Páginas públicas
    const publicPaths = ["/login", "/cadastro", "/forgot-password", "/reset-password"];
    if (!user && !publicPaths.includes(pathname)) {
      router.replace("/login");
    }
  }, [loading, user, pathname, router]);
}
