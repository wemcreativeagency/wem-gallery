"use client";

import { useState } from "react";
import Image from "next/image";
import { Media, Gallery } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { X, Send, Star } from "lucide-react";

interface Props {
  gallery: Gallery;
  favoriteMedia: Media[];
  sessionId: string;
  onClose: () => void;
}

export default function FavoritesPanel({ gallery, favoriteMedia, sessionId, onClose }: Props) {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const photos = favoriteMedia.filter((m) => m.type === "image");
  const videos = favoriteMedia.filter((m) => m.type === "video");

  async function sendSelection() {
    if (favoriteMedia.length === 0) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("selections").insert({
      gallery_id: gallery.id,
      session_id: sessionId,
      media_ids: favoriteMedia.map((m) => m.id),
      message: message || null,
    });
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <div className="w-full max-w-md bg-wem-surface h-full overflow-y-auto flex flex-col border-l border-wem-border">

        <div className="flex items-center justify-between px-6 py-5 border-b border-wem-border">
          <div>
            <h2 className="font-semibold text-wem-text">Mes Favoris</h2>
            <p className="text-xs text-wem-gray mt-0.5">
              {photos.length} photo(s) &middot; {videos.length} vid&eacute;o(s)
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-wem-border transition">
            <X size={18} className="text-wem-gray" />
          </button>
        </div>

        <div className="flex-1 px-6 py-4">
          {favoriteMedia.length === 0 ? (
            <div className="text-center py-12">
              <Star size={36} className="mx-auto text-wem-gray/30 mb-3" />
              <p className="text-wem-gray text-sm">Aucun favori s&eacute;lectionn&eacute;.</p>
              <p className="text-wem-gray/60 text-xs mt-1">
                Cliquez sur l&apos;&eacute;toile sur un m&eacute;dia pour l&apos;ajouter ici.
              </p>
            </div>
          ) : (
            <>
              {photos.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-wem-gray uppercase tracking-wider mb-3">
                    Photos Favorites ({photos.length})
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((m) => (
                      <div key={m.id} className="aspect-square rounded-lg overflow-hidden border border-wem-border">
                        <Image src={m.url} alt={m.filename} width={120} height={120} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {videos.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-wem-gray uppercase tracking-wider mb-3">
                    Vid&eacute;os Favorites ({videos.length})
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {videos.map((m) => (
                      <div key={m.id} className="aspect-square rounded-lg overflow-hidden bg-wem-black border border-wem-border">
                        <Image src={m.thumbnail_url || m.url} alt={m.filename} width={120} height={120} className="w-full h-full object-cover opacity-80" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!sent && (
                <div className="mb-4">
                  <label className="text-xs text-wem-gray mb-1.5 block">Message (optionnel)</label>
                  <textarea
                    rows={3}
                    placeholder="Ajoutez un commentaire pour We.m..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-wem-black text-wem-text placeholder-wem-gray border border-wem-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-wem-red resize-none"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {favoriteMedia.length > 0 && (
          <div className="px-6 py-4 border-t border-wem-border">
            {sent ? (
              <div className="text-center py-3">
                <p className="text-green-500 font-medium text-sm">&#10003; S&eacute;lection envoy&eacute;e &agrave; We.m !</p>
                <p className="text-wem-gray text-xs mt-1">L&apos;&eacute;quipe a re&ccedil;u votre s&eacute;lection.</p>
              </div>
            ) : (
              <button
                onClick={sendSelection}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-wem-red hover:bg-wem-red-dark text-wem-black font-semibold py-3 rounded-lg text-sm transition disabled:opacity-50"
              >
                <Send size={16} />
                {loading ? "Envoi..." : "Envoyer ma sélection à We.m"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
