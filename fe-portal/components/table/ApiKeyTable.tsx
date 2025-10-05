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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Copy,
    RefreshCw,
    Trash2,
    CheckCircle2,
    XCircle,
    Loader2,
} from "lucide-react"
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

export type ApiKey = {
    id: string | number
    name: string
    key: string
    status: "active" | "revoked"
    createdAt: string
}

export function ApiKeyTable({
                                data,
                                page,
                                pageSize,
                                total,
                                onPageChange,
                                onPageSizeChange,
                                onCopy,
                                onRevoke,
                                onDelete,
                                workingId,
                            }: {
    data: ApiKey[]
    page: number
    pageSize: number
    total: number
    onPageChange: (p: number) => void
    onPageSizeChange: (s: number) => void
    onCopy: (key: string) => void
    onRevoke: (id: string | number) => void
    onDelete: (id: string | number) => void
    workingId: string | number | null
}) {
    const columns: ColumnDef<ApiKey>[] = [
        {
            accessorKey: "name",
            header: "Tên",
            cell: ({ row }) => (
                <span className="font-medium">{row.original.name}</span>
            ),
        },
        {
            accessorKey: "key",
            header: "Key",
            cell: ({ row }) => (
                <span className="font-mono text-sm">
          {row.original.key.length > 10
              ? `${row.original.key.slice(0, 6)}••••${row.original.key.slice(-4)}`
              : "••••••••"}
        </span>
            ),
        },
        {
            accessorKey: "status",
            header: "Trạng thái",
            cell: ({ row }) =>
                row.original.status === "active" ? (
                    <Badge className="bg-green-500 text-white gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active
                    </Badge>
                ) : (
                    <Badge variant="destructive" className="gap-1">
                        <XCircle className="w-3 h-3" /> Revoked
                    </Badge>
                ),
        },
        {
            accessorKey: "createdAt",
            header: "Ngày tạo",
            cell: ({ row }) => (
                <span className="text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleString()}
        </span>
            ),
        },
        {
            id: "actions",
            header: "Hành động",
            cell: ({ row }) => {
                const item = row.original
                return (
                    <div className="flex gap-2 justify-end">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onCopy(item.key)}
                            className="h-8 px-2"
                        >
                            <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 px-2"
                            disabled={item.status === "revoked" || workingId === item.id}
                            onClick={() => onRevoke(item.id)}
                        >
                            {workingId === item.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 px-2"
                            disabled={workingId === item.id}
                            onClick={() => onDelete(item.id)}
                        >
                            {workingId === item.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                        </Button>
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

    const totalPages = Math.ceil(total / pageSize)

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
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
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
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
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
