"use client";

import Image from "next/image";
import { Media, Gallery } from "@/types";
import { X, Heart } from "lucide-react";

interface Props {
  gallery: Gallery;
  likedMedia: Media[];
  onClose: () => void;
}

export default function LikesPanel({ gallery, likedMedia, onClose }: Props) {
  const photos = likedMedia.filter((m) => m.type === "image");
  const videos = likedMedia.filter((m) => m.type === "video");

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50" onClick={onClose} />

      <div className="w-full max-w-md bg-wem-surface h-full overflow-y-auto flex flex-col border-l border-wem-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-wem-border">
          <div>
            <h2 className="font-semibold text-wem-text flex items-center gap-2">
              <Heart size={16} className="text-wem-red" fill="#EBB705" />
              Mes Likes
            </h2>
            <p className="text-xs text-wem-gray mt-0.5">
              {photos.length} photo(s) · {videos.length} vidéo(s)
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-wem-border transition">
            <X size={18} className="text-wem-gray" />
          </button>
        </div>

        {/* Gallery / Client folder label */}
        <div className="px-6 py-3 bg-wem-black/40 border-b border-wem-border">
          <p className="text-xs text-wem-gray">
            Galerie : <span className="text-wem-text font-medium">{gallery.name}</span>
          </p>
        </div>

        <div className="flex-1 px-6 py-4">
          {likedMedia.length === 0 ? (
            <div className="text-center py-12">
              <Heart size={36} className="mx-auto text-wem-gray/30 mb-3" />
              <p className="text-wem-gray text-sm">Aucun like pour l&apos;instant.</p>
              <p className="text-wem-gray/60 text-xs mt-1">
                Cliquez sur le cœur d&apos;un média pour l&apos;ajouter ici.
              </p>
            </div>
          ) : (
            <>
              {photos.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-wem-gray uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-wem-red inline-block" />
                    Photos likées ({photos.length})
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((m) => (
                      <div key={m.id} className="aspect-square rounded-lg overflow-hidden border border-wem-border">
                        <Image src={m.thumbnail_url || m.url} alt={m.filename} width={120} height={120} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {videos.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-wem-gray uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-wem-red inline-block" />
                    Vidéos likées ({videos.length})
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {videos.map((m) => (
                      <div key={m.id} className="aspect-square rounded-lg overflow-hidden bg-wem-black border border-wem-border">
                        <Image
                          src={m.thumbnail_url || m.url}
                          alt={m.filename}
                          width={120}
                          height={120}
                          className="w-full h-full object-cover opacity-80"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
