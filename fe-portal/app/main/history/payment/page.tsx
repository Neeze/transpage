"use client"

import { useEffect, useState } from "react"
import api from "@/lib/axios"
import { Card } from "@/components/ui/card"
import { Wallet, Loader2 } from "lucide-react"
import { PaymentHistoryTable, type Payment } from "@/components/table/PaymentHistoryTable"

export default function PaymentHistoryPage() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    const fetchPayments = async (p = page, ps = pageSize) => {
        setLoading(true)
        try {
            const res = await api.get("/payment/history", { params: { page: p, pageSize: ps } })
            if (res.data?.success) {
                setPayments(res.data.payments || [])
                const pg = res.data.pagination || {}
                const totalItems =
                    pg.total ?? pg.totalItems ?? pg.totalCount ??
                    (typeof pg.totalPages === "number" ? pg.totalPages * ps : 0)
                setTotal(totalItems)
            } else {
                console.error("❌ Lỗi lấy lịch sử:", res.data?.message)
            }
            setPage(p)
            setPageSize(ps)
        } catch (err) {
            console.error("❌ Fetch payments error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPayments(1, pageSize)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="container mx-auto px-6 py-10">
            <Card className="overflow-hidden shadow-lg rounded-xl p-4">
                {loading ? (
                    <div className="p-10 text-center text-muted-foreground flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin mb-3 opacity-70" />
                        <p>Đang tải lịch sử thanh toán...</p>
                    </div>
                ) : total === 0 ? (
                    <div className="p-10 text-center text-muted-foreground">
                        <Wallet className="w-10 h-10 mx-auto mb-3 opacity-70" />
                        <p className="text-lg">Chưa có giao dịch thanh toán nào.</p>
                    </div>
                ) : (
                    <PaymentHistoryTable
                        data={payments}
                        page={page}
                        pageSize={pageSize}
                        total={total}
                        onPageChange={(p) => fetchPayments(p, pageSize)}
                        onPageSizeChange={(ps) => fetchPayments(1, ps)}
                    />
                )}
            </Card>
        </div>
    )
}
