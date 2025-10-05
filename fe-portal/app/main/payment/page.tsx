"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Loader2, Wallet, History } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/axios"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function PaymentPage() {
    const [packages, setPackages] = useState<any[]>([])
    const [selectedPackage, setSelectedPackage] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [rate, setRate] = useState<number>(1000)

    const fetchPackages = async () => {
        try {
            const res = await api.get("/payment/packages")
            if (res.data.success) {
                setPackages(res.data.data)
                if (res.data.rate) setRate(res.data.rate)
            }
        } catch {
            toast.error("Không thể tải danh sách gói nạp")
        }
    }

    useEffect(() => {
        fetchPackages()
    }, [])

    const onPay = async () => {
        if (!selectedPackage) {
            toast.warning("Vui lòng chọn gói nạp")
            return
        }

        setLoading(true)
        try {
            const pkg = packages.find((p) => p.id === selectedPackage)
            const res = await api.post("/payment/create", {
                amount: pkg.amount,
                orderInfo: `Thanh toán ${pkg.label}`,
            })

            const data = res.data
            if (data.success && data.data?.payUrl) {
                toast.success("Chuyển sang MoMo để thanh toán...")
                window.location.href = data.data.payUrl
            } else {
                toast.error(data.message || "Không thể khởi tạo thanh toán")
            }
        } catch {
            toast.error("Lỗi gọi API thanh toán")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-6 pl-6 pr-4 md:pl-8">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">Nạp điểm qua MoMo</h1>
                <p className="text-sm text-muted-foreground">
                    Tỷ lệ quy đổi: <strong>1 điểm = {rate.toLocaleString("vi-VN")} VND</strong>
                </p>
            </div>

            <Card className="shadow-lg border border-gray-200 self-start max-w-3xl">
                <CardHeader className="flex flex-col gap-2 border-b pb-3">
                    <div className="flex items-center gap-3">
                        <Wallet className="w-6 h-6 text-primary" />
                        <h2 className="text-lg font-semibold tracking-tight">Chọn gói nạp</h2>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {packages.map((pkg) => (
                            <div
                                key={pkg.id}
                                onClick={() => setSelectedPackage(pkg.id)}
                                className={cn(
                                    "cursor-pointer rounded-xl border p-4 text-center transition-all",
                                    selectedPackage === pkg.id
                                        ? "border-primary bg-primary/10 shadow-sm"
                                        : "border-gray-200 hover:bg-muted/40"
                                )}
                            >
                                <h3 className="font-semibold">{pkg.label}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {Number(pkg.amount).toLocaleString("vi-VN")} VND
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                    Nhận {Number(pkg.points).toLocaleString("vi-VN")} điểm
                                </p>
                                {pkg.description && (
                                    <p className="text-xs text-muted-foreground mt-1">{pkg.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between border-t pt-4">
                    <Link href="/main/history/payment">
                        <Button variant="outline" className="gap-2">
                            <History className="w-4 h-4" /> Xem lịch sử
                        </Button>
                    </Link>

                    <Button
                        onClick={onPay}
                        disabled={loading}
                        size="lg"
                        className="min-w-[220px] transition-transform hover:scale-105"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang xử lý...
                            </>
                        ) : (
                            "Thanh toán qua MoMo"
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
