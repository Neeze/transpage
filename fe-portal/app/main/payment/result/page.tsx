"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

function PaymentResultContent() {
    const params = useSearchParams()
    const router = useRouter()

    const status = params.get("status")
    const message = params.get("message") || "Không có thông báo từ hệ thống."
    const points = params.get("points")
    const amount = params.get("amount")
    const orderId = params.get("orderId")
    const timestamp = new Date().toLocaleString("vi-VN")

    const [countdown, setCountdown] = useState(5)

    // ⏳ Đếm ngược & tự động quay lại /main/payment
    useEffect(() => {
        const timer = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000)
        const redirect = setTimeout(() => router.push("/main/payment"), 5000)
        return () => {
            clearInterval(timer)
            clearTimeout(redirect)
        }
    }, [router])

    // 🎬 Icon animation (pulse nhẹ 2 nhịp)
    const renderIcon = () => {
        const baseClass = "w-20 h-20 drop-shadow-lg mb-4"

        if (status === "success")
            return (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [1, 1.05, 1], opacity: [0, 1, 1] }}
                    transition={{ duration: 0.8, repeat: 1, ease: "easeInOut" }}
                >
                    <CheckCircle2 className={`${baseClass} text-green-500`} />
                </motion.div>
            )

        if (status === "failed")
            return (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [0.8, 1.0], opacity: [0, 1] }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <XCircle className={`${baseClass} text-red-500`} />
                </motion.div>
            )

        return (
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [0.8, 1.0], opacity: [0, 1] }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <AlertCircle className={`${baseClass} text-yellow-500`} />
            </motion.div>
        )
    }

    const title =
        status === "success"
            ? "Thanh toán thành công!"
            : status === "failed"
                ? "Thanh toán thất bại!"
                : "Kết quả giao dịch"

    const titleColor =
        status === "success"
            ? "text-green-600"
            : status === "failed"
                ? "text-red-600"
                : "text-yellow-600"

    return (
        <motion.div
            className="flex justify-center items-center h-[calc(100vh-8rem)]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <Card className="max-w-xl w-full border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
                {/* Header */}
                <CardHeader className="flex flex-col items-center bg-muted/40 py-8">
                    {renderIcon()}
                    <CardTitle
                        className={`text-2xl font-bold ${titleColor} tracking-tight text-center`}
                    >
                        {title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2 px-4 text-center">
                        {message}
                    </p>
                </CardHeader>

                {/* Content */}
                <CardContent className="space-y-4 px-8 py-6 text-sm">
                    <div className="flex justify-between">
                        <span className="font-medium text-muted-foreground">💰 Số tiền:</span>
                        <span className="font-semibold text-foreground">
              {amount ? `${Number(amount).toLocaleString("vi-VN")}₫` : "—"}
            </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="font-medium text-muted-foreground">⭐ Điểm cộng:</span>
                        <span
                            className={`font-semibold ${
                                status === "success" ? "text-green-600" : "text-muted-foreground"
                            }`}
                        >
              {points ? `+${points}` : "—"}
            </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="font-medium text-muted-foreground">🧾 Mã đơn hàng:</span>
                        <span className="font-mono text-foreground">{orderId || "—"}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="font-medium text-muted-foreground">⏰ Thời gian:</span>
                        <span className="text-foreground">{timestamp}</span>
                    </div>
                </CardContent>

                {/* Footer */}
                <CardFooter className="flex flex-col items-center border-t bg-muted/30 py-6 space-y-3">
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-sm text-muted-foreground"
                    >
                        Quay lại trang thanh toán sau{" "}
                        <span className="font-semibold text-foreground">{countdown}s</span>
                    </motion.p>

                    <div className="flex gap-3">
                        <Button
                            onClick={() => router.push("/main/payment")}
                            className="transition-transform duration-300 hover:scale-105"
                        >
                            Quay lại ngay
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push("/main/history/payment")}
                            className="transition-transform duration-300 hover:scale-105"
                        >
                            Xem lịch sử
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    )
}

export default function Page() {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center items-center h-[calc(100vh-8rem)] text-muted-foreground">
                    Đang tải kết quả thanh toán...
                </div>
            }
        >
            <PaymentResultContent />
        </Suspense>
    )
}
