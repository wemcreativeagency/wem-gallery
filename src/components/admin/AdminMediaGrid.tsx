"use client";

import { useState } from "react";
import { Media } from "@/types";
import { Play, Trash2, CheckSquare, Square, Trash, X, ChevronLeft, ChevronRight, FileText, Music } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Props {
  media: Media[];
  galleryId: string;
  onDelete?: (id: string) => void;
}

export default function AdminMediaGrid({ media, galleryId, onDelete }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);

  function toggleSelect(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(selected.size === media.length ? new Set() : new Set(media.map((m) => m.id)));
  }

  async function deleteMedia(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm("Supprimer ce média ?")) return;
    const supabase = createClient();
    await supabase.from("media").delete().eq("id", id);
    if (onDelete) onDelete(id);
    else router.refresh();
  }

  async function deleteSelected() {
    if (!selected.size || !confirm(`Supprimer ${selected.size} média(s) ?`)) return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("media").delete().in("id", [...selected]);
    const deleted = new Set(selected);
    setSelected(new Set());
    setDeleting(false);
    if (onDelete) deleted.forEach((id) => onDelete(id));
    else router.refresh();
  }

  if (media.length === 0) {
    return <p className="text-center text-wem-gray py-10 text-sm">Aucun média. Uploadez des fichiers ci-dessus.</p>;
  }

  const allSelected = selected.size === media.length;
  const current = lightbox !== null ? media[lightbox] : null;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={toggleAll} className="flex items-center gap-2 text-sm text-wem-gray hover:text-wem-text transition">
          <Square size={16} />
          Tout sélectionner
        </button>
        {selected.size > 0 && (
          <>
            <button onClick={() => setSelected(new Set())} className="text-xs text-wem-gray hover:text-wem-text transition underline">
              Désélectionner ({selected.size})
            </button>
            <button onClick={deleteSelected} disabled={deleting} className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm px-3 py-1.5 rounded-lg transition">
              <Trash size={14} />
              {deleting ? "Suppression…" : `Supprimer (${selected.size})`}
            </button>
          </>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {media.map((m, i) => (
          <div
            key={m.id}
            onClick={() => setLightbox(i)}
            className={`group relative aspect-square bg-wem-bg rounded-lg overflow-hidden cursor-pointer ring-2 transition ${
              selected.has(m.id) ? "ring-wem-red" : "ring-transparent hover:ring-white/20"
            }`}
          >
            {m.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.url} alt={m.filename} className="absolute inset-0 w-full h-full object-cover" />
            ) : m.type === "video" ? (
              <div className="absolute inset-0 flex items-center justify-center bg-wem-black/80">
                <Play size={28} className="text-white" fill="white" />
                {m.thumbnail_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.thumbnail_url} alt={m.filename} className="absolute inset-0 w-full h-full object-cover -z-10" />
                )}
              </div>
            ) : m.type === "document" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-wem-surface gap-2">
                <FileText size={32} className="text-orange-400" />
                <p className="text-[10px] text-wem-gray px-2 text-center truncate w-full">{m.filename}</p>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-wem-surface gap-2">
                <Music size={32} className="text-purple-400" />
                <p className="text-[10px] text-wem-gray px-2 text-center truncate w-full">{m.filename}</p>
              </div>
            )}

            {/* Checkbox top-left */}
            <div
              onClick={(e) => toggleSelect(e, m.id)}
              className="absolute top-2 left-2 z-10"
            >
              {selected.has(m.id) ? (
                <CheckSquare size={18} className="text-wem-red drop-shadow" />
              ) : (
                <Square size={18} className="text-white opacity-0 group-hover:opacity-80 transition drop-shadow" />
              )}
            </div>

            {/* Delete top-right */}
            <button
              onClick={(e) => deleteMedia(e, m.id)}
              className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              <Trash2 size={12} />
            </button>

            {/* Filename bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 opacity-0 group-hover:opacity-100 transition">
              <p className="text-white text-[10px] truncate">{m.filename}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && current && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={() => setLightbox(null)}>
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <span className="text-white/60 text-sm">{lightbox + 1} / {media.length}</span>
            <button onClick={() => setLightbox(null)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
              <X size={18} />
            </button>
          </div>

          {/* Image */}
          <div className="flex-1 relative flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightbox((i) => (i! > 0 ? i! - 1 : media.length - 1))}
              className="absolute left-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
            >
              <ChevronLeft size={24} />
            </button>

            {current.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={current.url} alt={current.filename} className="max-h-[75vh] max-w-5xl w-full mx-16 object-contain" />
            ) : current.type === "video" ? (
              <video src={current.url} controls autoPlay className="max-h-[75vh] max-w-5xl w-full mx-16" />
            ) : current.type === "document" ? (
              <iframe src={current.url} className="w-full h-[75vh] max-w-5xl mx-16 rounded-lg" />
            ) : (
              <audio src={current.url} controls className="mx-auto" />
            )}

            <button
              onClick={() => setLightbox((i) => (i! < media.length - 1 ? i! + 1 : 0))}
              className="absolute right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Filename */}
          <div className="px-6 py-3 text-center flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <p className="text-white/50 text-xs">{current.filename}</p>
          </div>
        </div>
      )}
    </div>
  );
}
