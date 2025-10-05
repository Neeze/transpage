import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{
                backgroundImage: "url('/images/gradient-bg.png')",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "top center",
                backgroundAttachment: "fixed",
                width: "100%",
            }}
        >
            <div className="w-full max-w-5xl">
                {children}
            </div>
        </div>
    );
}
