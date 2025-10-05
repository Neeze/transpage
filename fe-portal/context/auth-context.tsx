"use client";

import { createContext, useContext } from "react";

type AuthContextType = {
    user: any;
    loading: boolean;
    refetch: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
                                 children,
                                 value,
                             }: {
    children: React.ReactNode;
    value: AuthContextType;
}) {
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return ctx;
}
