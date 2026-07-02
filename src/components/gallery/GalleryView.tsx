"use client";

import { useState, useEffect } from "react";
import { Gallery, Media } from "@/types";
import MediaCard from "./MediaCard";
import LightBox from "./LightBox";
import FavoritesPanel from "./FavoritesPanel";
import LikesPanel from "./LikesPanel";
import { getSessionId } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Star, Heart, Download } from "lucide-react";

interface Props {
  gallery: Gallery & { media: Media[] };
}

export default function GalleryView({ gallery }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    const sid = getSessionId();
    setSessionId(sid);
    const supabase = createClient();
    Promise.all([
      supabase.from("likes").select("media_id").eq("session_id", sid),
      supabase.from("favorites").select("media_id").eq("session_id", sid),
    ]).then(([{ data: likes }, { data: favs }]) => {
      setLikedIds(new Set(likes?.map((l) => l.media_id) ?? []));
      setFavoritedIds(new Set(favs?.map((f) => f.media_id) ?? []));
    });
  }, []);

  async function toggleLike(mediaId: string) {
    const supabase = createClient();
    if (likedIds.has(mediaId)) {
      await supabase.from("likes").delete().eq("media_id", mediaId).eq("session_id", sessionId);
      setLikedIds((prev) => { const s = new Set(prev); s.delete(mediaId); return s; });
    } else {
      await supabase.from("likes").insert({ media_id: mediaId, session_id: sessionId });
      setLikedIds((prev) => new Set([...prev, mediaId]));
    }
  }

  async function toggleFavorite(mediaId: string) {
    const supabase = createClient();
    if (favoritedIds.has(mediaId)) {
      await supabase.from("favorites").delete().eq("media_id", mediaId).eq("session_id", sessionId);
      setFavoritedIds((prev) => { const s = new Set(prev); s.delete(mediaId); return s; });
    } else {
      await supabase.from("favorites").insert({ media_id: mediaId, session_id: sessionId });
      setFavoritedIds((prev) => new Set([...prev, mediaId]));
    }
  }

  async function downloadAll() {
    setDownloading(true);
    for (const item of gallery.media) {
      try {
        const res = await fetch(item.url);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = item.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        await new Promise((r) => setTimeout(r, 400));
      } catch {
        const a = document.createElement("a");
        a.href = item.url;
        a.download = item.filename;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        await new Promise((r) => setTimeout(r, 400));
      }
    }
    setDownloading(false);
  }

  const favoriteMedia = gallery.media.filter((m) => favoritedIds.has(m.id));
  const likedMedia = gallery.media.filter((m) => likedIds.has(m.id));

  return (
    <div className="min-h-screen bg-wem-bg">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-wem-black/95 backdrop-blur border-b border-wem-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          {/* Logo + titre */}
          <div className="flex items-center gap-2 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="We.m" className="w-8 h-8 object-contain flex-shrink-0" style={{ mixBlendMode: "screen" }} />
            <div className="min-w-0">
              <p className="font-semibold text-wem-text text-sm truncate">{gallery.name}</p>
              <p className="text-[11px] text-wem-gray">{gallery.media.length} médias</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Download */}
            {gallery.download_enabled && (
              <button
                onClick={downloadAll}
                disabled={downloading}
                className="flex items-center gap-1.5 bg-wem-surface border border-wem-border hover:border-wem-red text-wem-text px-2.5 py-2 rounded-lg text-xs font-medium transition disabled:opacity-50"
              >
                <Download size={14} className={downloading ? "animate-bounce" : ""} />
                <span className="hidden sm:inline">{downloading ? "..." : "Télécharger"}</span>
              </button>
            )}

            {/* Likes */}
            <button
              onClick={() => setShowLikes(true)}
              className="relative flex items-center gap-1.5 bg-wem-surface border border-wem-border hover:border-wem-red text-wem-text px-2.5 py-2 rounded-lg text-xs font-medium transition"
            >
              <Heart size={14} className="text-wem-red" fill={likedIds.size > 0 ? "#EBB705" : "none"} />
              <span className="hidden sm:inline">Likes</span>
              {likedIds.size > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-wem-red text-wem-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {likedIds.size}
                </span>
              )}
            </button>

            {/* Favoris */}
            <button
              onClick={() => setShowFavorites(true)}
              className="relative flex items-center gap-1.5 bg-wem-red hover:bg-wem-red-dark text-wem-black font-semibold px-2.5 py-2 rounded-lg text-xs transition"
            >
              <Star size={14} fill="currentColor" />
              <span className="hidden sm:inline">Favoris</span>
              {favoritedIds.size > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-wem-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {favoritedIds.size}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-8">
        {gallery.description && (
          <p className="text-wem-gray text-sm mb-4 md:mb-6">{gallery.description}</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-1.5 md:gap-3">
          {gallery.media.map((media, index) => (
            <MediaCard
              key={media.id}
              media={media}
              isLiked={likedIds.has(media.id)}
              isFavorited={favoritedIds.has(media.id)}
              onLike={() => toggleLike(media.id)}
              onFavorite={() => toggleFavorite(media.id)}
              onClick={() => setLightboxIndex(index)}
            />
          ))}
        </div>
      </main>

      {lightboxIndex !== null && (
        <LightBox
          media={gallery.media}
          initialIndex={lightboxIndex}
          likedIds={likedIds}
          favoritedIds={favoritedIds}
          onLike={toggleLike}
          onFavorite={toggleFavorite}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {showLikes && (
        <LikesPanel
          gallery={gallery}
          likedMedia={likedMedia}
          onClose={() => setShowLikes(false)}
        />
      )}

      {showFavorites && (
        <FavoritesPanel
          gallery={gallery}
          favoriteMedia={favoriteMedia}
          sessionId={sessionId}
          onClose={() => setShowFavorites(false)}
        />
      )}
    </div>
  );
}
