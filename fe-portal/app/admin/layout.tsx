"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
    { name: "Tổng quan", href: "/admin/dashboard", icon: LayoutDashboard },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex h-screen bg-muted/30">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-background">
                <div className="flex h-16 items-center px-4 border-b font-bold text-xl">Admin Panel</div>
                <nav className="flex flex-col p-2 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={pathname === item.href ? "secondary" : "ghost"}
                                    className="w-full justify-start"
                                >
                                    <Icon className="mr-2 h-4 w-4" />
                                    {item.name}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex flex-col flex-1">
                {/* Topbar */}
                <header className="h-16 border-b bg-background flex items-center justify-between px-6">
                    <h1 className="text-lg font-semibold">
                        {navItems.find((n) => pathname.startsWith(n.href))?.name || "Dashboard"}
                    </h1>
                    <div className="flex items-center gap-4">
                        {/*<Button variant="outline">Đăng xuất</Button>*/}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-6">{children}</main>
            </div>
        </div>
    );
}
