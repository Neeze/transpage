"use client";
import api from "@/lib/axios";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Download, FileText, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TranslatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadId, setDownloadId] = useState<string | null>(null);

  // State cho form
  const [sourceLang, setSourceLang] = useState("");
  const [targetLang, setTargetLang] = useState("");
  const [topic, setTopic] = useState("");
  const [outputFormat, setOutputFormat] = useState("");

  // Danh sách ngôn ngữ
  const [languages, setLanguages] = useState<Record<string, string>>({});
  const [langLoading, setLangLoading] = useState(true);

  // Lấy danh sách ngôn ngữ hỗ trợ từ backend
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await api.get("/translate/supported-languages");
        setLanguages(res.data.languages || {});
      } catch (err) {
        console.error("Failed to load supported languages:", err);
      } finally {
        setLangLoading(false);
      }
    };
    fetchLanguages();
  }, []);

  // chọn file bằng click
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type !== "application/pdf" && !selected.name.endsWith(".pdf")) {
      alert("❌ Chỉ được phép tải lên tệp PDF!");
      e.target.value = "";
      return;
    }

    setFile(selected);
    setDownloadId(null);
  };

  // kéo & thả file
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;

    if (dropped.type !== "application/pdf" && !dropped.name.endsWith(".pdf")) {
      alert("❌ Chỉ được phép tải lên tệp PDF!");
      return;
    }

    setFile(dropped);
    setDownloadId(null);
  };

  // gọi API dịch
  const handleTranslate = async () => {
    if (!file) return;
    setLoading(true);
    setDownloadId(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("source_lang", sourceLang || "auto");
    formData.append("target_lang", targetLang || "vi");
    formData.append("topic", topic || "general");
    formData.append("output_format", outputFormat || "pdf");

    try {
      const res = await api.post("/translate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { jobId } = res.data;

      let status = "Pending";
      while (status === "Pending" || status === "Processing") {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const statusRes = await api.get(`/translate/status/${jobId}`);
        status = statusRes.data.status;
      }

      if (status === "Completed") {
        setDownloadId(jobId);
      } else {
        alert("❌ Dịch thất bại, vui lòng thử lại.");
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Có lỗi xảy ra khi dịch.");
    } finally {
      setLoading(false);
    }
  };

  // tải file kết quả
  const handleDownload = async (jobId: string) => {
    try {
      const res = await api.get(`/translate/download/${jobId}`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${jobId}_translated.${outputFormat || "pdf"}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("⚠️ Tải file thất bại!");
    }
  };

  return (
      <div className="container mx-auto px-6 py-12 space-y-10">
        {/* Upload Zone */}
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
          <Card
              className={`border-2 border-dashed rounded-2xl cursor-pointer shadow-md transition-all ${
                  isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
          >
            <CardContent className="flex flex-col items-center justify-center py-20 space-y-4">
              <Upload className="w-14 h-14 text-blue-500" />
              <p className="text-lg font-semibold text-gray-700">
                Kéo & thả tệp hoặc bấm để chọn
              </p>
              <input
                  id="file-input"
                  type="file"
                  accept=".pdf" // ✅ chỉ cho phép PDF
                  className="hidden"
                  onChange={handleFileSelect}
              />
              <p className="text-xs text-gray-500">Chỉ hỗ trợ tệp PDF</p>
              {file && (
                  <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-blue-600 font-medium"
                  >
                    Đã chọn: {file.name}
                  </motion.p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Options */}
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Source Language */}
          <div>
            <Select onValueChange={setSourceLang}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Ngôn ngữ gốc" />
              </SelectTrigger>
              <SelectContent>
                {langLoading ? (
                    <SelectItem value="loading" disabled>
                      <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                      Đang tải...
                    </SelectItem>
                ) : (
                    Object.entries(languages)
                        .map(([code, name]) => (
                            <SelectItem key={code} value={code}>
                              {name}
                            </SelectItem>
                        ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Target Language */}
          <div>
            <Select onValueChange={setTargetLang}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Ngôn ngữ dịch" />
              </SelectTrigger>
              <SelectContent>
                {langLoading ? (
                    <SelectItem value="loading" disabled>
                      <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                      Đang tải...
                    </SelectItem>
                ) : (
                    Object.entries(languages)
                        .filter(
                            ([code, name]) =>
                                code.toLowerCase() !== "auto" &&
                                name.toLowerCase() !== "auto"
                        )
                        .map(([code, name]) => (
                            <SelectItem key={code} value={code}>
                              {name}
                            </SelectItem>
                        ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Topic */}
          <div>
            <Select onValueChange={setTopic}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chủ đề dịch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Chung</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Output Format */}
          <div>
            <Select onValueChange={setOutputFormat}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Định dạng đầu ra" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="docx">Docx</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Action */}
        <div className="flex justify-center">
          <Button
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 px-8 py-3 text-lg rounded-xl shadow"
              disabled={!file || loading}
              onClick={handleTranslate}
          >
            {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang dịch...
                </>
            ) : (
                "Dịch ngay"
            )}
          </Button>
        </div>

        {/* Result */}
        <AnimatePresence>
          {loading && (
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-yellow-50 border border-yellow-200 p-5 rounded-xl flex items-center gap-3 shadow justify-center"
              >
                <Loader2 className="w-6 h-6 text-yellow-600 animate-spin" />
                <span className="text-sm font-medium text-yellow-700">
              Hệ thống đang xử lý bản dịch, vui lòng chờ...
            </span>
              </motion.div>
          )}

          {downloadId && !loading && (
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-green-50 border border-green-200 p-6 rounded-xl flex items-center justify-between shadow"
              >
                <div className="flex items-center gap-4">
                  <FileText className="w-12 h-12 text-green-600" />
                  <div>
                    <p className="text-base font-semibold text-green-700">
                      Bản dịch đã sẵn sàng 🎉
                    </p>
                    <p className="text-sm text-gray-600">
                      {file?.name.replace(/\.[^/.]+$/, "")}_translated.
                      {outputFormat || "pdf"}
                    </p>
                  </div>
                </div>
                <Button
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    onClick={() => handleDownload(downloadId)}
                >
                  <Download className="w-4 h-4" /> Tải về
                </Button>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}
