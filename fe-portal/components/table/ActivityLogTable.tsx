"use client"

import * as React from "react"
import {
    ColumnDef, flexRender, getCoreRowModel, useReactTable,
} from "@tanstack/react-table"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Pagination, PaginationContent, PaginationItem,
    PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

export type Log = {
    id: number
    action: string
    metadata: Record<string, any> | null
    pointBefore: number | null
    pointChange: number | null
    pointAfter: number | null
    createdAt: string
}

type Props = {
    data: Log[]
    loading: boolean
    page: number
    pageSize: number
    total: number
    onPageChange: (p: number) => void
    onPageSizeChange: (s: number) => void
}

export function ActivityLogTable({
                                     data,
                                     loading,
                                     page,
                                     pageSize,
                                     total,
                                     onPageChange,
                                     onPageSizeChange,
                                 }: Props) {
    const columns: ColumnDef<Log>[] = [
        {
            accessorKey: "createdAt",
            header: "Thời gian",
            cell: ({ row }) => (
                <span className="text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleString()}
        </span>
            ),
        },
        {
            accessorKey: "action",
            header: "Hoạt động",
            cell: ({ row }) => renderAction(row.original.action),
        },
        {
            id: "points",
            header: "Số dư",
            cell: ({ row }) => {
                const log = row.original
                return log.pointBefore !== null && log.pointAfter !== null ? (
                    <span>
            {log.pointBefore} →{" "}
                        <span
                            className={
                                log.pointChange && log.pointChange > 0
                                    ? "text-green-600 font-bold"
                                    : "text-red-600 font-bold"
                            }
                        >
              {log.pointAfter}
            </span>
          </span>
                ) : (
                    "-"
                )
            },
        },
        {
            accessorKey: "metadata",
            header: "Chi tiết",
            cell: ({ row }) => renderMetadata(row.original.metadata),
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
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id} className="bg-muted/50 text-sm font-semibold">
                                {hg.headers.map((h) => (
                                    <TableHead key={h.id} className="px-4 py-3">
                                        {flexRender(h.column.columnDef.header, h.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {loading ? (
                            Array.from({ length: pageSize }).map((_, i) => (
                                <TableRow key={`sk-${i}`}>
                                    {columns.map((_, ci) => (
                                        <TableCell key={`skc-${ci}`} className="px-4 py-3">
                                            <Skeleton className="h-4 w-32" />
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

            {/* Pagination giống ApiKeyTable */}
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

function renderAction(action: string) {
    switch (action) {
        case "TRANSLATE_FILE":
            return <Badge className="bg-blue-500 text-white">Dịch tài liệu</Badge>
        case "LOGIN_GOOGLE":
            return <Badge className="bg-green-500 text-white">Đăng nhập</Badge>
        default:
            return <Badge variant="outline">{action}</Badge>
    }
}

function renderMetadata(metadata: Record<string, any> | null) {
    if (!metadata) return "-"
    const entries = Object.entries(metadata)
    if (entries.length === 0) return "-"
    return (
        <div className="space-y-1">
            {entries.map(([k, v]) => (
                <div key={k} className="text-xs text-gray-700">
                    <span className="font-medium text-gray-900">{k}:</span>{" "}
                    <span className="text-gray-600">
            {typeof v === "object" ? JSON.stringify(v) : String(v)}
          </span>
                </div>
            ))}
        </div>
    )
}
