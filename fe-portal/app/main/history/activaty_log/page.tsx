"use client"

import { useEffect, useState } from "react"
import api from "@/lib/axios"
import { Card } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { ActivityLogTable, type Log } from "@/components/table/ActivityLogTable"

export default function ActivityLogPage() {
    const [logs, setLogs] = useState<Log[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(5)
    const [total, setTotal] = useState(0)

    const fetchLogs = async (p = page, ps = pageSize) => {
        setLoading(true)
        try {
            const res = await api.get("/activity-logs", { params: { page: p, pageSize: ps } })
            setLogs(res.data.logs || [])

            const pg = res.data.pagination || {}
            const totalItems =
                pg.total ?? pg.totalItems ?? pg.totalCount ??
                (typeof pg.totalPages === "number" ? pg.totalPages * ps : 0)
            setTotal(totalItems)

            setPage(p)
            setPageSize(ps)
        } catch (err) {
            console.error("Fetch logs error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs(1, pageSize)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="container mx-auto px-6 py-10">
            <Card className="overflow-hidden shadow-lg rounded-xl p-4">
                {!loading && total === 0 ? (
                    <div className="p-10 text-center text-muted-foreground">
                        <Clock className="w-10 h-10 mx-auto mb-3 opacity-70" />
                        <p className="text-lg">Chưa có hoạt động nào.</p>
                    </div>
                ) : (
                    <ActivityLogTable
                        data={logs}
                        loading={loading}
                        page={page}
                        pageSize={pageSize}
                        total={total}
                        onPageChange={(p) => fetchLogs(p, pageSize)}
                        onPageSizeChange={(ps) => fetchLogs(1, ps)}
                    />
                )}
            </Card>
        </div>
    )
}
