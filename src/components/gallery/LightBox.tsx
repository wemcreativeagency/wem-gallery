"use client";

import { useState, useEffect, useCallback } from "react";
import { Media } from "@/types";
import { X, ChevronLeft, ChevronRight, Heart, Star, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  media: Media[];
  initialIndex: number;
  likedIds: Set<string>;
  favoritedIds: Set<string>;
  onLike: (id: string) => void;
  onFavorite: (id: string) => void;
  onClose: () => void;
}

export default function LightBox({
  media,
  initialIndex,
  likedIds,
  favoritedIds,
  onLike,
  onFavorite,
  onClose,
}: Props) {
  const [index, setIndex] = useState(initialIndex);
  const current = media[index];

  const prev = useCallback(() => setIndex((i) => (i > 0 ? i - 1 : media.length - 1)), [media.length]);
  const next = useCallback(() => setIndex((i) => (i < media.length - 1 ? i + 1 : 0)), [media.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, onClose]);

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={onClose}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <span className="text-white/60 text-sm">{index + 1} / {media.length}</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onFavorite(current.id)}
            className={cn(
              "p-2 rounded-full transition",
              favoritedIds.has(current.id)
                ? "bg-yellow-400 text-white"
                : "bg-wem-surface/10 text-white hover:bg-yellow-400"
            )}
          >
            <Star size={18} fill={favoritedIds.has(current.id) ? "currentColor" : "none"} />
          </button>
          <button
            onClick={() => onLike(current.id)}
            className={cn(
              "p-2 rounded-full transition",
              likedIds.has(current.id)
                ? "bg-wem-red text-white"
                : "bg-wem-surface/10 text-white hover:bg-wem-red"
            )}
          >
            <Heart size={18} fill={likedIds.has(current.id) ? "currentColor" : "none"} />
          </button>
          <button onClick={onClose} className="p-2 rounded-full bg-wem-surface/10 text-white hover:bg-wem-surface/20 transition">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 relative flex items-center justify-center">
        {/* Prev */}
        <button
          onClick={prev}
          className="absolute left-4 z-10 p-3 bg-wem-surface/10 hover:bg-wem-surface/20 rounded-full text-white transition"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Media */}
        <div className="relative max-h-full max-w-5xl w-full mx-16">
          {current.type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={current.url}
              alt={current.filename}
              className="max-h-[70vh] w-full object-contain"
            />
          ) : current.type === "video" ? (
            <video src={current.url} controls autoPlay className="max-h-[70vh] w-full" />
          ) : current.type === "document" ? (
            <iframe src={current.url} className="w-full h-[70vh] rounded-lg bg-white" />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <FileText size={64} className="text-orange-400" />
              <a href={current.url} target="_blank" rel="noopener noreferrer" className="text-wem-red underline text-sm">
                Ouvrir le fichier
              </a>
            </div>
          )}
        </div>

        {/* Next */}
        <button
          onClick={next}
          className="absolute right-4 z-10 p-3 bg-wem-surface/10 hover:bg-wem-surface/20 rounded-full text-white transition"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Filmstrip */}
      <div className="flex gap-2 overflow-x-auto px-6 py-4 scrollbar-thin">
        {media.map((m, i) => (
          <button
            key={m.id}
            onClick={() => setIndex(i)}
            className={cn(
              "flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition",
              i === index ? "border-wem-red" : "border-transparent opacity-50 hover:opacity-100"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={m.thumbnail_url || m.url}
              alt={m.filename}
              className="object-cover w-full h-full"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
