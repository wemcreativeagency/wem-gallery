"use client";

import { useState, useEffect } from "react";
import { Gallery, Media } from "@/types";
import MediaCard from "./MediaCard";
import LightBox from "./LightBox";
import FavoritesPanel from "./FavoritesPanel";
import LikesPanel from "./LikesPanel";
import { getSessionId } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Star, Heart, Download, ChevronDown } from "lucide-react";
import Image from "next/image";

interface Props {
  gallery: Gallery & { media: Media[] };
}

export default function GalleryView({ gallery }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
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

  async function downloadFiles(items: Media[]) {
    setDownloading(true);
    setShowDownloadMenu(false);
    for (const item of items) {
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
        // Small delay between downloads
        await new Promise((r) => setTimeout(r, 400));
      } catch {
        // If CORS blocks blob download, fallback to direct link
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
    <div className="min-h-screen bg-wem-bg" onClick={() => setShowDownloadMenu(false)}>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-wem-black/95 backdrop-blur border-b border-wem-border">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="We.m" width={40} height={40} className="object-contain" style={{ mixBlendMode: "screen" }} />
            <span className="text-base font-bold text-white tracking-tight">
              we<span className="text-wem-red">.</span>m
            </span>
          </div>

          {/* Titre */}
          <div className="text-center">
            <h1 className="font-semibold text-wem-text text-sm">{gallery.name}</h1>
            <p className="text-xs text-wem-gray">{gallery.media.length} médias</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2" onClick={() => setShowDownloadMenu(false)}>
            {/* Télécharger — seulement si autorisé */}
            {gallery.download_enabled && (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setShowDownloadMenu((v) => !v)}
                  disabled={downloading}
                  className="flex items-center gap-1.5 bg-wem-surface border border-wem-border hover:border-wem-red text-wem-text px-3 py-2 rounded-lg text-xs font-medium transition disabled:opacity-50"
                >
                  <Download size={13} className={downloading ? "animate-bounce" : ""} />
                  {downloading ? "Téléchargement..." : "Télécharger"}
                  <ChevronDown size={11} className={`transition-transform ${showDownloadMenu ? "rotate-180" : ""}`} />
                </button>

                {showDownloadMenu && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-wem-surface border border-wem-border rounded-xl shadow-xl overflow-hidden z-50">
                    <button
                      onClick={() => downloadFiles(favoriteMedia)}
                      disabled={favoriteMedia.length === 0}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-xs text-wem-text hover:bg-wem-black/50 transition disabled:opacity-40 disabled:cursor-not-allowed border-b border-wem-border"
                    >
                      <Star size={12} fill="#EBB705" className="text-wem-red flex-shrink-0" />
                      <span>
                        Ma s&eacute;lection
                        <span className="text-wem-gray ml-1">({favoriteMedia.length})</span>
                      </span>
                    </button>
                    <button
                      onClick={() => downloadFiles(gallery.media)}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-xs text-wem-text hover:bg-wem-black/50 transition"
                    >
                      <Download size={12} className="text-wem-gray flex-shrink-0" />
                      <span>
                        Tout t&eacute;l&eacute;charger
                        <span className="text-wem-gray ml-1">({gallery.media.length})</span>
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mes Likes */}
            <button
              onClick={() => setShowLikes(true)}
              className="relative flex items-center gap-1.5 bg-wem-surface border border-wem-border hover:border-wem-red text-wem-text px-3 py-2 rounded-lg text-xs font-medium transition"
            >
              <Heart size={13} className="text-wem-red" fill={likedIds.size > 0 ? "#EBB705" : "none"} />
              Mes Likes
              {likedIds.size > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-wem-red text-wem-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {likedIds.size}
                </span>
              )}
            </button>

            {/* Mes Favoris */}
            <button
              onClick={() => setShowFavorites(true)}
              className="relative flex items-center gap-1.5 bg-wem-red hover:bg-wem-red-dark text-wem-black font-semibold px-3 py-2 rounded-lg text-xs transition"
            >
              <Star size={13} fill="currentColor" className="text-wem-black" />
              Mes Favoris
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
      <main className="max-w-7xl mx-auto px-6 py-8">
        {gallery.description && (
          <p className="text-wem-gray text-sm mb-6 max-w-2xl">{gallery.description}</p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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

      {/* Lightbox */}
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

      {/* Likes panel */}
      {showLikes && (
        <LikesPanel
          gallery={gallery}
          likedMedia={likedMedia}
          onClose={() => setShowLikes(false)}
        />
      )}

      {/* Favorites panel */}
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
