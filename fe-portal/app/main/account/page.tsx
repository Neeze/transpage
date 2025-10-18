"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import api from "@/lib/axios"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Shield, Coins, User, Lock } from "lucide-react"

export default function AccountPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [form, setForm] = useState({
        username: "",
        avatarUrl: "",
        currentPassword: "",
        newPassword: "",
    })

    const fetchUserInfo = async () => {
        try {
            const res = await api.get("/info")
            if (res.data.success) {
                setUser(res.data.data)
                setForm((f) => ({
                    ...f,
                    username: res.data.data.username || "",
                    avatarUrl: res.data.data.avatarUrl || "",
                }))
            } else {
                toast.error("Không thể lấy thông tin tài khoản")
            }
        } catch (err) {
            toast.error("Lỗi kết nối máy chủ")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUserInfo()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await api.put("/update", form)
            if (res.data.success) {
                toast.success("Cập nhật thông tin thành công")
                await fetchUserInfo()
                setForm((f) => ({ ...f, currentPassword: "", newPassword: "" }))
            } else {
                toast.error(res.data.message || "Cập nhật thất bại")
            }
        } catch (err) {
            toast.error("Lỗi cập nhật thông tin")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                Không thể tải thông tin người dùng.
            </div>
        )
    }

    return (
        <div className="container mx-auto px-6 py-10 space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Card className="shadow-lg border rounded-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <User className="w-5 h-5 text-primary" />
                            Thông tin tài khoản
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="flex flex-col items-center gap-3">
                            <Avatar className="w-24 h-24 border shadow-md">
                                <AvatarImage src={user.avatarUrl} alt={user.username} />
                                <AvatarFallback>{user.username?.[0] || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="w-full">
                                <Label htmlFor="avatarUrl">URL ảnh đại diện</Label>
                                <Input
                                    id="avatarUrl"
                                    value={form.avatarUrl}
                                    onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div>
                                <Label htmlFor="username">Tên người dùng</Label>
                                <Input
                                    id="username"
                                    value={form.username}
                                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Email</Label>
                                <Input value={user.email} disabled />
                            </div>
                            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Shield className="w-4 h-4 text-blue-500" />
                                    <span>{user.role}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    ⚡
                                    <span>{user.points.toLocaleString("vi-VN")} điểm</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {user.provider === "local" && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <Card className="shadow-lg border rounded-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Lock className="w-5 h-5 text-primary" />
                                Đổi mật khẩu
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={form.currentPassword}
                                    onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={form.newPassword}
                                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 text-base"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang lưu...
                        </>
                    ) : (
                        "Lưu thay đổi"
                    )}
                </Button>
            </div>
        </div>
    )
}
