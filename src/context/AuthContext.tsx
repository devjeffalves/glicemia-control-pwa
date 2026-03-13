"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface User {
    _id: string;
    nome: string;
    email: string;
    // outros campos do usuário
}

interface AuthContextProps {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
    user: null,
    loading: true,
    logout: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUser() {
            try {
                const res = await fetch("/api/auth/me", {
                    method: "GET",
                    credentials: "include", // ✅ envia o cookie com JWT
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Erro ao carregar usuário:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        loadUser();
    }, []);

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include", // ✅ garante que o cookie seja enviado
            });
            setUser(null);
            window.location.href = "/login";
        } catch (error) {
            console.error("Erro ao deslogar:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook para acessar AuthContext facilmente
export function useAuth() {
    return useContext(AuthContext);
}