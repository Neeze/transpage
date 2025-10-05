"use client"

import { useEffect, useMemo, useState } from "react"
import api from "@/lib/axios"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { KeyRound, Loader2, Plus, RefreshCw, Search } from "lucide-react"
import { ApiKeyTable, type ApiKey } from "@/components/table/ApiKeyTable"

type Pagination = {
    total: number
    page: number
    pageSize: number
    totalPages: number
}

export default function ApiKeysPage() {
    const [items, setItems] = useState<ApiKey[]>([])
    const [pg, setPg] = useState<Pagination>({
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 1,
    })
    const [loading, setLoading] = useState(true)

    // UI controls
    const [query, setQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<
        "all" | "active" | "revoked"
    >("all")

    // Create dialog
    const [openCreate, setOpenCreate] = useState(false)
    const [creatingName, setCreatingName] = useState("")
    const [submitting, setSubmitting] = useState(false)

    // Row states
    const [workingId, setWorkingId] = useState<string | number | null>(null)

    const fetchList = async (page = pg.page, pageSize = pg.pageSize) => {
        setLoading(true)
        try {
            const res = await api.get("/api-key", { params: { page, pageSize } })
            setItems(res.data.apiKeys ?? [])
            setPg(res.data.pagination)
        } catch (e) {
            console.error(e)
            toast.error("Không thể tải danh sách API key")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchList(1, pg.pageSize)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // client-side filter/search
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        return items
            .filter((k) =>
                statusFilter === "all" ? true : k.status === statusFilter
            )
            .filter((k) =>
                q
                    ? k.name.toLowerCase().includes(q) ||
                    k.key.toLowerCase().includes(q)
                    : true
            )
            .sort(
                (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
            )
    }, [items, query, statusFilter])

    const copyKey = async (val: string) => {
        try {
            await navigator.clipboard.writeText(val)
            toast.success("Đã copy API key")
        } catch {
            toast.error("Copy thất bại")
        }
    }

    const handleCreate = async () => {
        if (!creatingName.trim()) {
            toast("Vui lòng nhập tên key")
            return
        }
        setSubmitting(true)
        try {
            await api.post("/api-key", { name: creatingName.trim() })
            setCreatingName("")
            setOpenCreate(false)
            toast.success("Tạo API key thành công")
            fetchList(1, pg.pageSize)
        } catch {
            toast.error("Không thể tạo API key")
        } finally {
            setSubmitting(false)
        }
    }

    const handleRevoke = async (id: string | number) => {
        setWorkingId(id)
        try {
            const res = await api.put(`/api-key/${id}/revoke`)
            const updated = res.data?.apiKey as ApiKey | undefined
            setItems((prev) =>
                prev.map((k) =>
                    k.id === id ? updated ?? { ...k, status: "revoked" } : k
                )
            )
            toast.success("Đã thu hồi key")
        } catch {
            toast.error("Thu hồi thất bại")
        } finally {
            setWorkingId(null)
        }
    }

    const handleDelete = async (id: string | number) => {
        setWorkingId(id)
        try {
            await api.delete(`/api-key/${id}`)
            toast.success("Đã xóa key")
            fetchList(pg.page, pg.pageSize)
        } catch {
            toast.error("Xóa thất bại")
        } finally {
            setWorkingId(null)
        }
    }

    return (
        <div className="container mx-auto px-6 py-10">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between gap-4">

                <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" /> Tạo API key
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tạo API key mới</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2">
                            <Label htmlFor="key-name">Tên key</Label>
                            <Input
                                id="key-name"
                                placeholder="VD: Server - Production"
                                value={creatingName}
                                onChange={(e) => setCreatingName(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={handleCreate}
                                disabled={submitting}
                                className="gap-2"
                            >
                                {submitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Plus className="w-4 h-4" />
                                )}{" "}
                                Tạo
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Toolbar */}
            <Card className="p-4 md:p-5 shadow-lg rounded-xl mb-4 flex flex-col md:flex-row gap-3">
                <div className="relative md:w-[360px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder="Tìm theo tên hoặc key…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <div className="md:ml-auto">
                    <Button
                        variant="secondary"
                        onClick={() => fetchList(pg.page, pg.pageSize)}
                        className="gap-2"
                    >
                        <RefreshCw className="w-4 h-4" /> Làm mới
                    </Button>
                </div>
            </Card>

            {/* Table */}
            <Card className="overflow-hidden shadow-lg rounded-xl">
                {loading ? (
                    <div className="text-center py-16 text-muted-foreground">
                        Đang tải…
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                        Không tìm thấy API key nào.
                    </div>
                ) : (
                    <ApiKeyTable
                        data={filtered}
                        page={pg.page}
                        pageSize={pg.pageSize}
                        total={pg.total}
                        onPageChange={(p) => fetchList(p, pg.pageSize)}
                        onPageSizeChange={(s) => fetchList(1, s)}
                        onCopy={copyKey}
                        onRevoke={handleRevoke}
                        onDelete={handleDelete}
                        workingId={workingId}
                    />
                )}
            </Card>
        </div>
    )
}
