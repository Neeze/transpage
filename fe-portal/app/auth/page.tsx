"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { GoogleLogin } from "@react-oauth/google";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // 👈 dùng sonner

export default ({className}: { className?: string }) => {
    const router = useRouter();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm({ ...form, [e.target.id]: e.target.value });

    const handleSubmit = async (type: "login" | "register") => {
        if (type === "register" && form.password !== form.confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp");
            return;
        }

        const url = type === "login" ? "/api/login" : "/api/register";
        const body =
            type === "login"
                ? { email: form.email, password: form.password }
                : { username: form.username, email: form.email, password: form.password };

        try {
            const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            console.log("API response:", data);

            if (res.ok) {
                localStorage.setItem("token", data.data.token);
                toast.success(data.message || "Đăng nhập thành công");
                router.push("/");
            } else {
                toast.error(data.message || "Có lỗi xảy ra");
            }
        } catch (err) {
            toast.error("Không thể kết nối máy chủ");
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)}>
            <Card className="overflow-hidden p-0 shadow-xl">
                <CardContent className="grid p-0 md:grid-cols-2">
                    {/* Form */}
                    <div className="p-6 md:p-8">
                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid grid-cols-2 mb-6">
                                <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                                <TabsTrigger value="register">Đăng ký</TabsTrigger>
                            </TabsList>

                            {/* Login */}
                            <TabsContent value="login" className="space-y-4">
                                <div className="flex flex-col items-center text-center">
                                    <h1 className="text-2xl font-bold">Chào mừng trở lại</h1>
                                    <p className="text-muted-foreground">Đăng nhập để tiếp tục</p>
                                </div>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSubmit("login");
                                    }}
                                    className="flex flex-col gap-4"
                                >
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Mật khẩu</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={form.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full">
                                        Đăng nhập
                                    </Button>
                                </form>

                                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Hoặc đăng nhập với
                  </span>
                                </div>
                                <div className="flex justify-center">
                                    <GoogleLogin
                                        onSuccess={async (credentialResponse) => {
                                            try {
                                                const res = await fetch(
                                                    process.env.NEXT_PUBLIC_BACKEND_URL + "/api/google-login",
                                                    {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({
                                                            token: credentialResponse.credential,
                                                        }),
                                                    }
                                                );
                                                const data = await res.json();
                                                console.log("Google login response:", data);

                                                if (res.ok) {
                                                    localStorage.setItem("token", data.data.token);
                                                    toast.success("Đăng nhập Google thành công");
                                                    router.push("/");
                                                } else {
                                                    toast.error(data.message);
                                                }
                                            } catch {
                                                toast.error("Không thể kết nối Google Login");
                                            }
                                        }}
                                        onError={() => toast.error("Đăng nhập Google thất bại")}
                                    />
                                </div>
                            </TabsContent>

                            {/* Register */}
                            <TabsContent value="register" className="space-y-4">
                                <div className="flex flex-col items-center text-center">
                                    <h1 className="text-2xl font-bold">Tạo tài khoản</h1>
                                    <p className="text-muted-foreground">
                                        Đăng ký để bắt đầu hành trình của bạn
                                    </p>
                                </div>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSubmit("register");
                                    }}
                                    className="flex flex-col gap-4"
                                >
                                    <div className="grid gap-2">
                                        <Label htmlFor="username">Tên người dùng</Label>
                                        <Input
                                            id="username"
                                            placeholder="Tên hiển thị"
                                            value={form.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Mật khẩu</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={form.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={form.confirmPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full">
                                        Đăng ký
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Hình minh họa */}
                    <div className="bg-muted relative hidden md:block">
                        <img
                            src="https://ui.shadcn.com/placeholder.svg"
                            alt="Auth Image"
                            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.3] dark:grayscale"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="text-gray-950 text-center text-xs">
                Bằng cách tiếp tục, bạn đồng ý với{" "}
                <a href="#" className="underline underline-offset-4">
                    Điều khoản dịch vụ
                </a>{" "}
                và{" "}
                <a href="#" className="underline underline-offset-4">
                    Chính sách bảo mật
                </a>
                .
            </div>
        </div>
    );
}
