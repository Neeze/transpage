"use client"

import * as React from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
} from "@/components/ui/pagination"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type Payment = {
    id: number
    orderId: string
    amount: number
    points: number
    orderInfo: string
    status: "pending" | "success" | "failed"
    payType?: string
    transId?: string
    message?: string
    createdAt: string
}

export function PaymentHistoryTable({
                                        data,
                                        page,
                                        pageSize,
                                        total,
                                        onPageChange,
                                        onPageSizeChange,
                                    }: {
    data: Payment[]
    page: number
    pageSize: number
    total: number
    onPageChange: (p: number) => void
    onPageSizeChange: (s: number) => void
}) {
    const columns: ColumnDef<Payment>[] = [
        {
            accessorKey: "orderId",
            header: "Mã đơn hàng",
            cell: ({ row }) => (
                <span className="font-mono text-sm text-gray-700">
          {row.original.orderId}
        </span>
            ),
        },
        {
            accessorKey: "amount",
            header: "Số tiền (VND)",
            cell: ({ row }) => (
                <span className="font-medium text-blue-600">
          {Number(row.original.amount || 0).toLocaleString("vi-VN")} ₫
        </span>
            ),
        },
        {
            accessorKey: "points",
            header: "Điểm nhận",
            cell: ({ row }) => (
                <span className="font-semibold text-green-600">
          {Number(row.original.points || 0).toLocaleString("vi-VN")}
        </span>
            ),
        },
        {
            accessorKey: "status",
            header: "Trạng thái",
            cell: ({ row }) => {
                const s = row.original.status
                const label =
                    s === "success" ? "Thành công" : s === "failed" ? "Thất bại" : "Chờ xử lý"
                const color =
                    s === "success"
                        ? "bg-green-500"
                        : s === "failed"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                return (
                    <Badge className={cn("gap-1 text-white", color)}>
                        {label}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "message",
            header: "Ghi chú",
            cell: ({ row }) => {
                const message = row.original.message || "-"
                const shortMessage =
                    message.length > 30 ? message.slice(0, 30) + "..." : message
                return (
                    <TooltipProvider delayDuration={100}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                <span className="text-sm text-gray-500 truncate max-w-[180px] block cursor-help">
                  {shortMessage}
                </span>
                            </TooltipTrigger>
                            {message && (
                                <TooltipContent className="max-w-sm bg-white text-gray-700 shadow-md p-2 rounded-md border text-sm">
                                    {message}
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                )
            },
        },
        {
            accessorKey: "createdAt",
            header: "Thời gian",
            cell: ({ row }) => (
                <span className="text-muted-foreground text-sm">
          {new Date(row.original.createdAt).toLocaleString("vi-VN")}
        </span>
            ),
        },
    ]

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const totalPages = Math.max(1, Math.ceil(total / pageSize))

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
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="hover:bg-muted/40 transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-4 py-3">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    Không có dữ liệu
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-4">
                <div className="text-sm text-muted-foreground">
                    Trang {page} / {totalPages} ({data.length} bản ghi trang hiện tại)
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
                            {[10, 20, 50].map((s) => (
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
                                    className={
                                        page < totalPages ? "" : "pointer-events-none opacity-50"
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </div>
    )
}
