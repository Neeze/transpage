"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Download, FileText } from "lucide-react";

export default function TranslatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // chọn file bằng click
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setDownloadUrl(null);
    }
  };

  // kéo & thả file
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setDownloadUrl(null);
    }
  };

  // gọi API dịch giả lập
  const handleTranslate = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/translate", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    }

    setLoading(false);
  };

  return (
      <div className="max-w-5xl mx-auto py-10 space-y-8">
        {/* Upload box */}
        <Card
            className={`border-2 border-dashed rounded-lg transition-all ${
                isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
            }}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <Upload className="w-12 h-12 text-blue-500" />
            <p className="text-center text-base text-gray-700 font-medium">
              Kéo & thả tệp hoặc bấm để chọn
            </p>
            <input
                id="file-input"
                type="file"
                className="hidden"
                onChange={handleFileSelect}
            />
            <p className="text-xs text-gray-500">
              Hỗ trợ: PDF, JPEG, PNG, TIFF, DOCX
            </p>
            {file && (
                <p className="text-sm text-blue-600 font-medium">
                  Đã chọn: {file.name}
                </p>
            )}
          </CardContent>
        </Card>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Ngôn ngữ gốc" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vi">Tiếng Việt</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Ngôn ngữ dịch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vi">Tiếng Việt</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Chủ đề dịch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">Chung</SelectItem>
              <SelectItem value="tech">Kỹ thuật</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Định dạng đầu ra" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="docx">DOCX</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action */}
        <div className="flex justify-end">
          <Button
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!file || loading}
              onClick={handleTranslate}
          >
            {loading ? "Đang dịch..." : "Dịch ngay"}
          </Button>
        </div>

        {/* Result */}
        {downloadUrl && (
            <div className="bg-blue-50 p-5 rounded-lg flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <FileText className="w-10 h-10 text-blue-600" />
                <div>
                  <p className="text-base font-semibold text-blue-700">
                    Bản dịch đã hoàn tất. Tải về ngay!
                  </p>
                  <p className="text-sm text-gray-600">
                    {file?.name.replace(/\.[^/.]+$/, "")}_translated.docx
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <a href={downloadUrl} download>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Download className="w-4 h-4 mr-2" /> Tải về
                  </Button>
                </a>
              </div>
            </div>
        )}
      </div>
  );
}
