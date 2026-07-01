"use client";

import { useRef, useState } from "react";
import { Pencil, X, ImagePlus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Props {
  galleryId: string;
  gallerySlug: string;
  galleryName: string;
  currentCoverImage: string | null;
  clientId: string | null;
  clientName: string;
  clientSector: string;
  clientStartedAt: string;
}

export default function GalleryCardActions({
  galleryId, gallerySlug, galleryName, currentCoverImage,
  clientId, clientName, clientSector, clientStartedAt,
}: Props) {
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentCoverImage);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: clientName,
    sector: clientSector,
    started_at: clientStartedAt ? clientStartedAt.slice(0, 10) : "",
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSave() {
    setSaving(true);
    let logoUrl = currentCoverImage;

    // Upload logo if a new file was selected
    if (pendingFile) {
      setUploading(true);
      const ext = pendingFile.name.split(".").pop();
      const path = `${galleryId}/logo.${ext}`;
      const { data, error } = await supabase.storage.from("gallery-logos").upload(path, pendingFile, { upsert: true });
      if (!error && data) {
        const { data: urlData } = supabase.storage.from("gallery-logos").getPublicUrl(path);
        logoUrl = urlData.publicUrl;
      }
      setUploading(false);
    }

    // Update gallery cover_image
    await supabase.from("galleries").update({ cover_image: logoUrl }).eq("id", galleryId);

    // Update client if linked
    if (clientId) {
      await supabase.from("clients").update({
        name: form.name,
        sector: form.sector || null,
        started_at: form.started_at || null,
      }).eq("id", clientId);
    }

    setSaving(false);
    setShowEdit(false);
    router.refresh();
  }

  async function deleteGallery() {
    setDeleting(true);
    await supabase.from("galleries").delete().eq("id", galleryId);
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        <button
          onClick={(e) => { e.preventDefault(); setShowEdit(true); }}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-wem-black/80 border border-wem-border hover:border-wem-red hover:text-wem-red text-wem-gray transition"
          title="Modifier"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); setConfirmDelete(true); }}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-wem-black/80 border border-wem-border hover:border-red-500 hover:text-red-400 text-wem-gray transition"
          title="Supprimer"
        >
          <X size={12} />
        </button>
      </div>

      {/* Edit modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setShowEdit(false)}>
          <div className="bg-wem-surface border border-wem-border rounded-2xl p-6 w-80 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-wem-text font-bold text-base">Modifier le client</h3>
              <button onClick={() => setShowEdit(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-wem-border hover:bg-wem-gray/30 text-wem-gray transition">
                <X size={14} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-[10px] font-semibold text-wem-gray uppercase tracking-wider mb-1.5">
                  Nom du client *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-wem-black border border-wem-red/60 rounded-lg px-3 py-2.5 text-sm text-wem-text focus:outline-none focus:border-wem-red transition"
                />
              </div>

              {/* Secteur */}
              <div>
                <label className="block text-[10px] font-semibold text-wem-gray uppercase tracking-wider mb-1.5">
                  Secteur d&apos;activit&eacute;
                </label>
                <input
                  type="text"
                  value={form.sector}
                  onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))}
                  placeholder="Ex: Restaurant, Mode, Tech..."
                  className="w-full bg-wem-black border border-wem-border rounded-lg px-3 py-2.5 text-sm text-wem-text placeholder-wem-gray/40 focus:outline-none focus:border-wem-red transition"
                />
              </div>

              {/* Date de début */}
              <div>
                <label className="block text-[10px] font-semibold text-wem-gray uppercase tracking-wider mb-1.5">
                  Date de d&eacute;but
                </label>
                <input
                  type="date"
                  value={form.started_at}
                  onChange={(e) => setForm((f) => ({ ...f, started_at: e.target.value }))}
                  className="w-full bg-wem-black border border-wem-border rounded-lg px-3 py-2.5 text-sm text-wem-text focus:outline-none focus:border-wem-red transition [color-scheme:dark]"
                />
              </div>

              {/* Logo */}
              <div>
                <label className="block text-[10px] font-semibold text-wem-gray uppercase tracking-wider mb-1.5">
                  Logo (optionnel)
                </label>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-wem-border hover:border-wem-red rounded-xl p-4 flex flex-col items-center gap-2 transition"
                >
                  {previewUrl ? (
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-wem-border">
                      <Image src={previewUrl} alt="logo" width={56} height={56} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-wem-black/60 border border-wem-border flex items-center justify-center">
                      <ImagePlus size={18} className="text-wem-gray" />
                    </div>
                  )}
                  <span className="text-[10px] text-wem-gray">
                    {previewUrl ? "Changer le logo" : "Cliquez pour ajouter"}
                  </span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowEdit(false)}
                className="flex-1 py-2.5 rounded-xl border border-wem-border text-wem-gray hover:text-wem-text text-sm transition">
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving || uploading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-wem-red hover:bg-wem-red-dark text-wem-black font-semibold text-sm transition disabled:opacity-50">
                {saving ? "Enregistrement..." : <><span>Enregistrer</span> <span>&rsaquo;</span></>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setConfirmDelete(false)}>
          <div className="bg-wem-surface border border-wem-border rounded-2xl p-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="text-wem-text font-semibold mb-1">Supprimer &laquo;{galleryName}&raquo; ?</h3>
            <p className="text-xs text-wem-gray mb-4">Tous les m&eacute;dias et donn&eacute;es associ&eacute;s seront supprim&eacute;s d&eacute;finitivement.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2 rounded-xl border border-wem-border text-wem-gray text-sm hover:text-wem-text transition">
                Annuler
              </button>
              <button onClick={deleteGallery} disabled={deleting}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition disabled:opacity-50">
                {deleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={handleFileSelect} />
    </>
  );
}
