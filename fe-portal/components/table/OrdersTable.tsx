"use client"

import * as React from "react"
import {
    ColumnDef, flexRender, getCoreRowModel, useReactTable,
} from "@tanstack/react-table"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Pagination, PaginationContent, PaginationItem,
    PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"
import { Download, Loader2, CheckCircle2, XCircle, Hourglass } from "lucide-react"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

export type Order = {
    id: number
    jobId: string
    sourceLang: string
    targetLang: string
    topic: string
    outputFormat: string
    status: "pending" | "processing" | "done" | "failed"
    costPoints: number
    createdAt: string
}

type Props = {
    data: Order[]
    loading: boolean
    page: number
    pageSize: number
    total: number
    onPageChange: (p: number) => void
    onPageSizeChange: (s: number) => void
    onDownload: (order: Order) => void
    workingId: number | null
}

export function OrdersTable({
                                data,
                                loading,
                                page,
                                pageSize,
                                total,
                                onPageChange,
                                onPageSizeChange,
                                onDownload,
                                workingId,
                            }: Props) {
    const columns: ColumnDef<Order>[] = [
        {
            accessorKey: "createdAt",
            header: "Ngày",
            cell: ({ row }) => (
                <span className="text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleString()}
        </span>
            ),
        },
        {
            accessorKey: "lang",
            header: "Ngôn ngữ",
            cell: ({ row }) => (
                <span>{row.original.sourceLang} → {row.original.targetLang}</span>
            ),
        },
        { accessorKey: "topic", header: "Chủ đề" },
        {
            accessorKey: "outputFormat",
            header: "Định dạng",
            cell: ({ row }) => <span className="uppercase">{row.original.outputFormat}</span>,
        },
        {
            accessorKey: "costPoints",
            header: "Chi phí",
            cell: ({ row }) => <span>{row.original.costPoints} $</span>,
        },
        {
            accessorKey: "status",
            header: "Trạng thái",
            cell: ({ row }) => renderStatus(row.original.status),
        },
        {
            id: "actions",
            header: "Hành động",
            cell: ({ row }) => {
                const item = row.original
                return (
                    <div className="flex justify-center">
                        {item.status === "done" && (
                            <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 gap-1"
                                disabled={workingId === item.id}
                                onClick={() => onDownload(item)}
                            >
                                {workingId === item.id
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <Download className="w-4 h-4" />}
                                Tải về
                            </Button>
                        )}
                    </div>
                )
            },
        },
    ]

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const totalPages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)))
    const start = (page - 1) * pageSize + 1
    const end = Math.min(page * pageSize, total)

    return (
        <div className="flex flex-col">
            <div className="rounded-xl border overflow-hidden">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                key={headerGroup.id}
                                className="bg-muted/50 text-sm font-semibold"
                            >
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="px-4 py-3">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {loading ? (
                            Array.from({ length: pageSize }).map((_, i) => (
                                <TableRow key={`sk-${i}`}>
                                    {columns.map((col, ci) => (
                                        <TableCell key={`skc-${ci}`} className="px-4 py-3">
                                            <Skeleton className={ci === columns.length - 1 ? "h-8 w-20 ml-auto" : "h-4 w-32"} />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="hover:bg-muted/40 transition-colors">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-4 py-3">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    Không có dữ liệu
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination: giống ApiKeyTable */}
            <div className="flex items-center justify-between px-4 py-4">
                <div className="text-sm text-muted-foreground">
                    Hiển thị {total === 0 ? 0 : start}–{end} / {total}
                </div>

                <div className="flex items-center gap-4">
                    <Select
                        value={`${pageSize}`}
                        onValueChange={(v) => onPageSizeChange(Number(v))}
                    >
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Rows" />
                        </SelectTrigger>
                        <SelectContent>
                            {[5, 10, 20].map((s) => (
                                <SelectItem key={s} value={`${s}`}>
                                    {s} dòng
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => page > 1 && onPageChange(page - 1)}
                                    className={page > 1 ? "" : "pointer-events-none opacity-50"}
                                />
                            </PaginationItem>

                            {Array.from({ length: totalPages }).map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        onClick={() => onPageChange(i + 1)}
                                        isActive={i + 1 === page}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => page < totalPages && onPageChange(page + 1)}
                                    className={page < totalPages ? "" : "pointer-events-none opacity-50"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </div>
    )
}

function renderStatus(status: Order["status"]) {
    switch (status) {
        case "pending":
            return <Badge variant="secondary" className="flex items-center gap-1"><Hourglass className="w-3 h-3" /> Chờ xử lý</Badge>
        case "processing":
            return <Badge variant="outline" className="flex items-center gap-1 text-yellow-600 border-yellow-400">
                <Loader2 className="w-3 h-3 animate-spin" /> Đang dịch
            </Badge>
        case "done":
            return <Badge className="bg-green-500 text-white flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Hoàn tất</Badge>
        case "failed":
            return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Thất bại</Badge>
        default:
            return <Badge>Unknown</Badge>
    }
}
