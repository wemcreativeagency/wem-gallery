"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { Media, UploadProgress } from "@/types";

interface Props {
  galleryId: string;
  gallerySlug: string;
  onUploadComplete?: (media: Media) => void;
}

const ACCEPTED = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/tiff": [".tif", ".tiff"],
  "image/gif": [".gif"],
  "image/svg+xml": [".svg"],
  "video/mp4": [".mp4"],
  "video/quicktime": [".mov"],
  "video/x-msvideo": [".avi"],
  "video/x-matroska": [".mkv"],
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.ms-powerpoint": [".ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "image/vnd.adobe.photoshop": [".psd"],
  "application/postscript": [".ai", ".eps"],
  "audio/wav": [".wav"],
  "audio/mpeg": [".mp3"],
  "audio/aac": [".aac"],
  "application/zip": [".zip"],
  "application/x-rar-compressed": [".rar"],
};

export default function UploadZone({ galleryId, gallerySlug, onUploadComplete }: Props) {
  const [files, setFiles] = useState<UploadProgress[]>([]);

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const newFiles: UploadProgress[] = accepted.map((f) => ({
        file: f,
        progress: 0,
        status: "pending",
      }));
      setFiles((prev) => [...prev, ...newFiles]);

      for (let i = 0; i < accepted.length; i++) {
        const file = accepted[i];
        const idx = files.length + i;

        setFiles((prev) =>
          prev.map((f, j) => (j === idx ? { ...f, status: "uploading", progress: 0 } : f))
        );

        // Animate progress bar while uploading
        const progressInterval = setInterval(() => {
          setFiles((prev) =>
            prev.map((f, j) =>
              j === idx && f.status === "uploading" && f.progress < 85
                ? { ...f, progress: f.progress + 5 }
                : f
            )
          );
        }, 200);

        try {
          const form = new FormData();
          form.append("file", file);
          form.append("galleryId", galleryId);
          form.append("gallerySlug", gallerySlug);

          const res = await fetch("/api/upload/file", { method: "POST", body: form });
          clearInterval(progressInterval);

          if (!res.ok) throw new Error("Upload failed");
          const { publicUrl, mediaId, type, filename, size_bytes } = await res.json();

          setFiles((prev) =>
            prev.map((f, j) =>
              j === idx ? { ...f, status: "done", progress: 100 } : f
            )
          );

          onUploadComplete?.({
            id: mediaId,
            gallery_id: galleryId,
            type: type ?? (file.type.startsWith("video/") ? "video" : "image"),
            url: publicUrl,
            thumbnail_url: publicUrl,
            filename: file.name,
            size_bytes: file.size,
            created_at: new Date().toISOString(),
          } as Media);

        } catch {
          clearInterval(progressInterval);
          setFiles((prev) =>
            prev.map((f, j) =>
              j === idx ? { ...f, status: "error", progress: 0 } : f
            )
          );
        }
      }
    },
    [galleryId, gallerySlug, files.length, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    multiple: true,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border border-dashed rounded-lg px-5 py-4 cursor-pointer transition ${
          isDragActive ? "border-wem-red bg-wem-red/5" : "border-wem-border hover:border-wem-red/40"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex items-center gap-4">
          <Upload className={`flex-shrink-0 transition ${isDragActive ? "text-wem-red" : "text-wem-gray"}`} size={22} />
          <div className="flex-1 min-w-0">
            <p className="text-wem-text font-medium text-sm">
              {isDragActive ? "Déposez les fichiers ici" : "Glissez-déposez ou"}
              {!isDragActive && <span className="text-wem-red ml-1">parcourir</span>}
            </p>
            <p className="text-wem-gray text-[11px] mt-0.5">
              JPG · PNG · TIFF · MP4 · MOV · PDF · PSD · WAV · ZIP
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="bg-wem-surface border border-wem-border rounded-lg px-4 py-3 overflow-hidden relative">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-wem-text truncate">{f.file.name}</p>
                  <p className="text-xs text-wem-gray">{formatBytes(f.file.size)}</p>
                </div>
                <div className="flex-shrink-0">
                  {f.status === "done" && <CheckCircle size={16} className="text-green-500" />}
                  {f.status === "error" && <AlertCircle size={16} className="text-red-400" />}
                  {f.status === "uploading" && (
                    <span className="text-xs text-wem-red font-medium">{f.progress}%</span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {f.status === "uploading" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-wem-border">
                  <div
                    className="h-full bg-wem-red transition-all duration-200"
                    style={{ width: `${f.progress}%` }}
                  />
                </div>
              )}
              {f.status === "done" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-green-500" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
