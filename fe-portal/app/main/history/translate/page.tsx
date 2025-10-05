"use client"

import { useEffect, useState } from "react"
import api from "@/lib/axios"
import { Card } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { OrdersTable, type Order } from "@/components/table/OrdersTable"

export default function HistoryPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(5)
    const [total, setTotal] = useState(0)
    const [workingId, setWorkingId] = useState<number | null>(null)

    const fetchOrders = async (p = page, ps = pageSize) => {
        setLoading(true)
        try {
            const res = await api.get("/translate/history", { params: { page: p, pageSize: ps } })
            setOrders(res.data.orders || [])

            // Chuẩn hóa total từ backend (tùy API của bạn)
            const pg = res.data.pagination || {}
            const totalItems =
                pg.total ?? pg.totalItems ?? pg.totalCount ??
                (typeof pg.totalPages === "number" ? pg.totalPages * ps : 0)
            setTotal(totalItems)

            setPage(p)
            setPageSize(ps)
        } catch (err) {
            console.error("Fetch history error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders(1, pageSize)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleDownload = async (order: Order) => {
        try {
            setWorkingId(order.id)
            const res = await api.get(`/translate/download/${order.jobId}`, { responseType: "blob" })
            const blob = new Blob([res.data], { type: "application/octet-stream" })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `${order.jobId}_translated.${order.outputFormat}`
            link.click()
            window.URL.revokeObjectURL(url)
        } catch (err) {
            console.error("Download error:", err)
            alert("⚠️ Không thể tải file.")
        } finally {
            setWorkingId(null)
        }
    }

    return (
        <div className="container mx-auto px-6 py-10">
            <Card className="overflow-hidden shadow-lg rounded-xl p-4">
                {/* Empty state nếu total = 0 và không loading */}
                {!loading && total === 0 ? (
                    <div className="p-10 text-center text-muted-foreground">
                        <Clock className="w-10 h-10 mx-auto mb-3 opacity-70" />
                        <p className="text-lg">Chưa có đơn dịch nào.</p>
                    </div>
                ) : (
                    <OrdersTable
                        data={orders}
                        loading={loading}
                        page={page}
                        pageSize={pageSize}
                        total={total}
                        onPageChange={(p) => fetchOrders(p, pageSize)}
                        onPageSizeChange={(ps) => fetchOrders(1, ps)}
                        onDownload={handleDownload}
                        workingId={workingId}
                    />
                )}
            </Card>
        </div>
    )
}
