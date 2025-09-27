"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Activity } from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
} from "@/components/ui/pagination";

type Log = {
    id: number;
    action: string;
    metadata: Record<string, any> | null;
    pointBefore: number | null;
    pointChange: number | null;
    pointAfter: number | null;
    createdAt: string;
};

export default function ActivityLogPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchLogs = async (page: number) => {
        setLoading(true);
        try {
            const res = await api.get("/activity-logs", {
                params: { page, pageSize: 5 },
            });
            setLogs(res.data.logs);
            setTotalPages(res.data.pagination.totalPages);
        } catch (err) {
            console.error("Fetch logs error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(page);
    }, [page]);

    const actionBadge = (action: string) => {
        switch (action) {
            case "TRANSLATE_FILE":
                return <Badge className="bg-blue-500 text-white">Dịch tài liệu</Badge>;
            case "LOGIN_GOOGLE":
                return <Badge className="bg-green-500 text-white">Đăng nhập</Badge>;
            default:
                return <Badge variant="outline">{action}</Badge>;
        }
    };

    const renderMetadata = (metadata: Record<string, any> | null) => {
        if (!metadata) return "-";

        const entries = Object.entries(metadata);
        if (entries.length === 0) return "-";

        return (
            <div className="space-y-1">
                {entries.map(([key, value]) => (
                    <div key={key} className="text-xs text-gray-700">
                        <span className="font-medium text-gray-900">{key}:</span>{" "}
                        <span className="text-gray-600">
              {typeof value === "object"
                  ? JSON.stringify(value)
                  : String(value)}
            </span>
                    </div>
                ))}
            </div>
        );
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

        return (
            <Pagination className="mt-6">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (page > 1) setPage(page - 1);
                            }}
                        />
                    </PaginationItem>

                    {pages.map((p) => (
                        <PaginationItem key={p}>
                            <PaginationLink
                                href="#"
                                isActive={p === page}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setPage(p);
                                }}
                            >
                                {p}
                            </PaginationLink>
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (page < totalPages) setPage(page + 1);
                            }}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        );
    };

    return (
        <div className="container mx-auto px-6 py-10">

            <Card className="overflow-hidden shadow-lg rounded-xl p-4">
                {loading ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Thời gian</TableHead>
                                <TableHead>Hoạt động</TableHead>
                                <TableHead>Số dư</TableHead>
                                <TableHead>Chi tiết</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : logs.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        <Clock className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                        <p className="text-lg">Chưa có hoạt động nào.</p>
                    </div>
                ) : (
                    <>
                        <div className="max-h-[500px] overflow-y-auto">
                            <Table>
                                <TableCaption>Lịch sử các hoạt động của bạn</TableCaption>
                                <TableHeader className="sticky top-0 bg-gray-50">
                                    <TableRow>
                                        <TableHead>Thời gian</TableHead>
                                        <TableHead>Hoạt động</TableHead>
                                        <TableHead>Số dư</TableHead>
                                        <TableHead>Chi tiết</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map((log) => (
                                        <TableRow key={log.id} className="hover:bg-gray-50">
                                            <TableCell>
                                                {new Date(log.createdAt).toLocaleString()}
                                            </TableCell>
                                            <TableCell>{actionBadge(log.action)}</TableCell>
                                            <TableCell>
                                                {log.pointBefore !== null &&
                                                log.pointAfter !== null ? (
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
                                                )}
                                            </TableCell>
                                            <TableCell>{renderMetadata(log.metadata)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        {renderPagination()}
                    </>
                )}
            </Card>
        </div>
    );
}
