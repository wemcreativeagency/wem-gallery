"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Client } from "@/types";
import { UserCheck, Check } from "lucide-react";

interface Props {
  galleryId: string;
  currentClientId: string | null;
  clients: Client[];
}

export default function GalleryClientAssign({ galleryId, currentClientId, clients }: Props) {
  const [selected, setSelected] = useState(currentClientId ?? "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("galleries")
      .update({ client_id: selected || null })
      .eq("id", galleryId);
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  }

  const changed = selected !== (currentClientId ?? "");

  return (
    <div className="flex items-center gap-2">
      <UserCheck size={14} className="text-wem-gray flex-shrink-0" />
      <select
        value={selected}
        onChange={(e) => { setSelected(e.target.value); setSaved(false); }}
        className="bg-wem-surface text-wem-text border border-wem-border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-wem-red transition"
      >
        <option value="">Aucun client</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      {changed && (
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1 bg-wem-red hover:bg-wem-red-dark text-wem-black text-xs font-semibold px-2.5 py-1.5 rounded-lg transition disabled:opacity-50"
        >
          {saved ? <><Check size={11} /> Enregistr&eacute;</> : saving ? "..." : "Assigner"}
        </button>
      )}
    </div>
  );
}
