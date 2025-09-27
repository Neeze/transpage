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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Download,
    Clock,
    Loader2,
    CheckCircle2,
    XCircle,
    Hourglass,
} from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
} from "@/components/ui/pagination";

type Order = {
    id: number;
    jobId: string;
    sourceLang: string;
    targetLang: string;
    topic: string;
    outputFormat: string;
    status: "pending" | "processing" | "done" | "failed";
    costPoints: number;
    createdAt: string;
};

export default function HistoryPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchOrders = async (page: number) => {
        setLoading(true);
        try {
            const res = await api.get("/translate/history", {
                params: { page, pageSize: 5 },
            });
            setOrders(res.data.orders);
            setTotalPages(res.data.pagination.totalPages);
        } catch (err) {
            console.error("Fetch history error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(page);
    }, [page]);

    const statusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <Badge variant="secondary" className="flex items-center gap-1">
                        <Hourglass className="w-3 h-3" /> Chờ xử lý
                    </Badge>
                );
            case "processing":
                return (
                    <Badge variant="outline" className="flex items-center gap-1 text-yellow-600 border-yellow-400">
                        <Loader2 className="w-3 h-3 animate-spin" /> Đang dịch
                    </Badge>
                );
            case "done":
                return (
                    <Badge variant="default" className="bg-green-500 text-white flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Hoàn tất
                    </Badge>
                );
            case "failed":
                return (
                    <Badge variant="destructive" className="flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Thất bại
                    </Badge>
                );
            default:
                return <Badge>Unknown</Badge>;
        }
    };

    const handleDownload = async (jobId: string, format: string) => {
        try {
            const res = await api.get(`/translate/download/${jobId}`, {
                responseType: "blob",
            });
            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `${jobId}_translated.${format}`;
            link.click();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download error:", err);
            alert("⚠️ Không thể tải file.");
        }
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
                                <TableHead>Ngày</TableHead>
                                <TableHead>Ngôn ngữ</TableHead>
                                <TableHead>Chủ đề</TableHead>
                                <TableHead>Định dạng</TableHead>
                                <TableHead>Chi phí</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-center">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell className="text-center"><Skeleton className="h-8 w-16" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : orders.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        <Clock className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                        <p className="text-lg">Chưa có đơn dịch nào.</p>
                    </div>
                ) : (
                    <>
                        <div className="max-h-[500px] overflow-y-auto">
                            <Table>
                                <TableCaption>Lịch sử các đơn dịch</TableCaption>
                                <TableHeader className="sticky top-0 bg-gray-50">
                                    <TableRow>
                                        <TableHead>Ngày</TableHead>
                                        <TableHead>Ngôn ngữ</TableHead>
                                        <TableHead>Chủ đề</TableHead>
                                        <TableHead>Định dạng</TableHead>
                                        <TableHead>Chi phí</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-center">Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order.id} className="hover:bg-gray-50">
                                            <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                                            <TableCell>{order.sourceLang} → {order.targetLang}</TableCell>
                                            <TableCell>{order.topic}</TableCell>
                                            <TableCell className="uppercase">{order.outputFormat}</TableCell>
                                            <TableCell>{order.costPoints} $</TableCell>
                                            <TableCell>{statusBadge(order.status)}</TableCell>
                                            <TableCell className="text-center">
                                                {order.status === "done" && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                        onClick={() =>
                                                            handleDownload(order.jobId, order.outputFormat)
                                                        }
                                                    >
                                                        <Download className="w-4 h-4 mr-1" /> Tải về
                                                    </Button>
                                                )}
                                            </TableCell>
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
