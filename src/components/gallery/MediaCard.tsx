"use client";

import { Media } from "@/types";
import { Heart, Star, Play, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  media: Media;
  isLiked: boolean;
  isFavorited: boolean;
  onLike: () => void;
  onFavorite: () => void;
  onClick: () => void;
}

export default function MediaCard({ media, isLiked, isFavorited, onLike, onFavorite, onClick }: Props) {
  return (
    <div className="group relative aspect-square bg-wem-black/5 rounded-xl overflow-hidden cursor-pointer">
      {/* Media */}
      <div onClick={onClick} className="absolute inset-0">
        {media.type === "document" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-wem-surface gap-2">
            <FileText size={36} className="text-orange-400" />
            <p className="text-[11px] text-wem-gray px-3 text-center truncate w-full">{media.filename}</p>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.thumbnail_url || media.url}
            alt={media.filename}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        )}
        {media.type === "video" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="bg-wem-surface/90 rounded-full p-2.5">
              <Play size={18} className="text-wem-text" fill="currentColor" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
      </div>

      {/* Actions */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={(e) => { e.stopPropagation(); onFavorite(); }}
          className={cn(
            "p-2 rounded-full backdrop-blur-sm transition",
            isFavorited
              ? "bg-yellow-400 text-white"
              : "bg-wem-surface/80 text-wem-text hover:bg-yellow-400 hover:text-white"
          )}
        >
          <Star size={14} fill={isFavorited ? "currentColor" : "none"} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onLike(); }}
          className={cn(
            "p-2 rounded-full backdrop-blur-sm transition",
            isLiked
              ? "bg-wem-red text-white"
              : "bg-wem-surface/80 text-wem-text hover:bg-wem-red hover:text-white"
          )}
        >
          <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Persistent indicators when active */}
      {(isLiked || isFavorited) && (
        <div className="absolute top-2 left-2 flex gap-1">
          {isFavorited && (
            <div className="bg-yellow-400 p-1 rounded-full">
              <Star size={10} className="text-white" fill="white" />
            </div>
          )}
          {isLiked && (
            <div className="bg-wem-red p-1 rounded-full">
              <Heart size={10} className="text-white" fill="white" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
