"use client";

import { useRef, useState } from "react";
import { MoreHorizontal, ImagePlus, ExternalLink, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Props {
  galleryId: string;
  gallerySlug: string;
  currentCoverImage: string | null;
}

export default function GalleryCardMenu({ galleryId, gallerySlug, currentCoverImage }: Props) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setOpen(false);

    // Upload to Supabase Storage bucket "gallery-logos"
    const ext = file.name.split(".").pop();
    const path = `${galleryId}/logo.${ext}`;
    const { data, error } = await supabase.storage
      .from("gallery-logos")
      .upload(path, file, { upsert: true });

    if (!error && data) {
      const { data: urlData } = supabase.storage.from("gallery-logos").getPublicUrl(path);
      await supabase.from("galleries").update({ cover_image: urlData.publicUrl }).eq("id", galleryId);
      router.refresh();
    }
    setUploading(false);
  }

  async function removeLogo() {
    setOpen(false);
    await supabase.from("galleries").update({ cover_image: null }).eq("id", galleryId);
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.preventDefault(); setOpen((v) => !v); }}
        className="p-1.5 rounded-lg bg-wem-black/60 border border-wem-border text-wem-gray hover:text-wem-text hover:border-wem-text transition opacity-0 group-hover:opacity-100"
        title="Options"
      >
        <MoreHorizontal size={13} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1.5 w-44 bg-wem-surface border border-wem-border rounded-xl shadow-xl overflow-hidden z-30">
            {/* Upload logo */}
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-wem-text hover:bg-wem-black/50 transition border-b border-wem-border"
            >
              <ImagePlus size={13} className="text-wem-gray" />
              {uploading ? "Envoi..." : currentCoverImage ? "Changer le logo" : "Ajouter un logo"}
            </button>

            {/* Remove logo */}
            {currentCoverImage && (
              <button
                onClick={removeLogo}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-wem-text hover:bg-wem-black/50 transition border-b border-wem-border"
              >
                <Trash2 size={13} className="text-wem-gray" />
                Supprimer le logo
              </button>
            )}

            {/* View gallery */}
            <a
              href={`/g/${gallerySlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-wem-text hover:bg-wem-black/50 transition"
              onClick={() => setOpen(false)}
            >
              <ExternalLink size={13} className="text-wem-gray" />
              Voir la galerie
            </a>
          </div>
        </>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleLogoUpload}
      />
    </div>
  );
}
