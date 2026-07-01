"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { Client } from "@/types";

interface Props {
  clients: Client[];
}

export default function NewGalleryForm({ clients }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    client_id: "",
    visibility: "private",
    password: "",
    download_enabled: false,
  });

  function handleNameChange(name: string) {
    setForm((f) => ({ ...f, name, slug: slugify(name) }));
  }

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error } = await supabase
      .from("galleries")
      .insert({
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        client_id: form.client_id || null,
        visibility: form.visibility,
        password: form.visibility === "password" ? form.password : null,
        download_enabled: form.download_enabled,
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(`/admin/galleries/${data.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-wem-surface rounded-xl border border-wem-border p-6 space-y-5">
      {/* Nom */}
      <div>
        <label className="block text-sm font-medium text-wem-text mb-1.5">Nom du projet *</label>
        <input
          type="text"
          required
          placeholder="Ex: Campagne Meiji Juin 2026"
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full bg-wem-surface text-wem-text border border-wem-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-wem-red transition"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-wem-text mb-1.5">URL slug</label>
        <div className="flex items-center border border-wem-border rounded-lg overflow-hidden">
          <span className="px-3 py-2.5 bg-wem-bg text-wem-gray text-sm border-r border-wem-border">/g/</span>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            className="bg-wem-surface text-wem-text flex-1 px-3 py-2.5 text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Client */}
      <div>
        <label className="block text-sm font-medium text-wem-text mb-1.5">Client</label>
        <select
          value={form.client_id}
          onChange={(e) => set("client_id", e.target.value)}
          className="w-full border border-wem-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-wem-red transition bg-wem-surface text-wem-text"
        >
          <option value="">Sélectionner un client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-wem-text mb-1.5">Description</label>
        <textarea
          rows={3}
          placeholder="Description optionnelle..."
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className="w-full bg-wem-surface text-wem-text border border-wem-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-wem-red transition resize-none"
        />
      </div>

      {/* Visibilité */}
      <div>
        <label className="block text-sm font-medium text-wem-text mb-1.5">Visibilité</label>
        <div className="flex gap-2">
          {["public", "private", "password"].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => set("visibility", v)}
              className={`flex-1 py-2 rounded-lg text-sm border transition ${
                form.visibility === v
                  ? "border-wem-red bg-wem-red/5 text-wem-red font-medium"
                  : "border-wem-border text-wem-gray hover:border-wem-text"
              }`}
            >
              {v === "public" ? "Public" : v === "private" ? "Privé" : "Mot de passe"}
            </button>
          ))}
        </div>
        {form.visibility === "password" && (
          <input
            type="text"
            placeholder="Mot de passe de la galerie"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            className="mt-2 w-full bg-wem-surface text-wem-text border border-wem-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-wem-red transition"
          />
        )}
      </div>

      {/* Type de lien */}
      <div>
        <label className="block text-sm font-medium text-wem-text mb-2">Type d&apos;acc&egrave;s client</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, download_enabled: false }))}
            className={`flex flex-col items-center gap-1.5 py-3 px-3 rounded-lg border text-sm transition ${
              !form.download_enabled
                ? "border-wem-red bg-wem-red/5 text-wem-red font-medium"
                : "border-wem-border text-wem-gray hover:border-wem-text"
            }`}
          >
            <span className="text-lg">👁️</span>
            <span>Regarder &amp; valider</span>
            <span className="text-[10px] opacity-60">Sans t&eacute;l&eacute;chargement</span>
          </button>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, download_enabled: true }))}
            className={`flex flex-col items-center gap-1.5 py-3 px-3 rounded-lg border text-sm transition ${
              form.download_enabled
                ? "border-wem-red bg-wem-red/5 text-wem-red font-medium"
                : "border-wem-border text-wem-gray hover:border-wem-text"
            }`}
          >
            <span className="text-lg">⬇️</span>
            <span>T&eacute;l&eacute;charger</span>
            <span className="text-[10px] opacity-60">Acc&egrave;s au t&eacute;l&eacute;chargement</span>
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-wem-red hover:bg-wem-red-dark text-wem-black font-semibold font-medium py-2.5 rounded-lg transition disabled:opacity-50"
      >
        {loading ? "Création..." : "Créer la galerie"}
      </button>
    </form>
  );
}

