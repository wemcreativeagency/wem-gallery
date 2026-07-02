"use client";

import { useState } from "react";
import { Client } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

export default function ClientsTable({ clients: init }: { clients: Client[] }) {
  const router = useRouter();
  const [clients, setClients] = useState(init);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const supabase = createClient();

  async function addClient(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data } = await supabase.from("clients").insert({ name, email }).select().single();
    if (data) setClients((prev) => [...prev, data]);
    setName(""); setEmail(""); setShowForm(false); setLoading(false);
  }

  function startEdit(c: Client) {
    setEditId(c.id); setEditName(c.name); setEditEmail(c.email);
  }

  async function saveEdit(id: string) {
    await supabase.from("clients").update({ name: editName, email: editEmail }).eq("id", id);
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, name: editName, email: editEmail } : c));
    setEditId(null);
  }

  async function deleteClient(id: string) {
    await supabase.from("clients").delete().eq("id", id);
    setClients((prev) => prev.filter((c) => c.id !== id));
    setConfirmDelete(null);
  }

  const clientToDelete = clients.find((c) => c.id === confirmDelete);

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-wem-red hover:bg-wem-red-dark text-wem-black font-semibold px-3 py-2 rounded-lg text-sm transition"
        >
          <Plus size={14} /> Ajouter
        </button>
      </div>

      {showForm && (
        <form onSubmit={addClient} className="bg-wem-surface border border-wem-border rounded-xl p-3 mb-3 flex flex-col sm:flex-row gap-2">
          <input type="text" placeholder="Nom" required value={name} onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-wem-black text-wem-text border border-wem-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-wem-red" />
          <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-wem-black text-wem-text border border-wem-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-wem-red" />
          <button type="submit" disabled={loading}
            className="bg-wem-red text-wem-black font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50">
            {loading ? "..." : "Ajouter"}
          </button>
        </form>
      )}

      {/* Mobile: cards */}
      <div className="md:hidden space-y-2">
        {clients.length === 0 ? (
          <p className="text-center text-wem-gray text-sm py-8">Aucun client encore.</p>
        ) : clients.map((c) => (
          <div key={c.id} className="bg-wem-surface border border-wem-border rounded-xl p-3">
            {editId === c.id ? (
              <div className="space-y-2">
                <input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus
                  className="w-full bg-wem-black text-wem-text border border-wem-red rounded-lg px-3 py-2 text-sm focus:outline-none" />
                <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-wem-black text-wem-text border border-wem-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-wem-red" />
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(c.id)} className="flex-1 py-2 rounded-lg bg-green-700 text-white text-sm font-medium"><Check size={14} className="inline mr-1" />Sauver</button>
                  <button onClick={() => setEditId(null)} className="flex-1 py-2 rounded-lg border border-wem-border text-wem-gray text-sm">Annuler</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-wem-text text-sm truncate">{c.name}</p>
                  <p className="text-wem-gray text-xs truncate">{c.email}</p>
                  <p className="text-wem-gray text-[10px] mt-0.5">{new Date(c.created_at).toLocaleDateString("fr-FR")}</p>
                </div>
                <div className="flex gap-1 ml-2 flex-shrink-0">
                  <button onClick={() => startEdit(c)} className="p-2 rounded-lg hover:bg-wem-border text-wem-gray hover:text-wem-text transition">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setConfirmDelete(c.id)} className="p-2 rounded-lg hover:bg-red-900/30 text-wem-gray hover:text-red-400 transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block bg-wem-surface rounded-xl border border-wem-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-wem-border">
              <th className="text-left text-wem-gray font-medium px-4 py-3">Nom</th>
              <th className="text-left text-wem-gray font-medium px-4 py-3">Email</th>
              <th className="text-left text-wem-gray font-medium px-4 py-3">Ajouté le</th>
              <th className="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr><td colSpan={4} className="text-center text-wem-gray py-8">Aucun client encore.</td></tr>
            ) : clients.map((c) => (
              <tr key={c.id} className="border-b border-wem-border/50 last:border-0 hover:bg-white/5 group">
                <td className="px-4 py-3 font-medium text-wem-text">
                  {editId === c.id
                    ? <input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus
                        className="bg-wem-black text-wem-text border border-wem-red rounded px-2 py-1 text-sm w-full focus:outline-none" />
                    : c.name}
                </td>
                <td className="px-4 py-3 text-wem-gray">
                  {editId === c.id
                    ? <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                        className="bg-wem-black text-wem-text border border-wem-border rounded px-2 py-1 text-sm w-full focus:outline-none focus:border-wem-red" />
                    : c.email}
                </td>
                <td className="px-4 py-3 text-wem-gray">{new Date(c.created_at).toLocaleDateString("fr-FR")}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                    {editId === c.id ? (
                      <>
                        <button onClick={() => saveEdit(c.id)} className="p-1.5 rounded-lg hover:bg-green-900/30 text-wem-gray hover:text-green-400 transition"><Check size={14} /></button>
                        <button onClick={() => setEditId(null)} className="p-1.5 rounded-lg hover:bg-wem-border text-wem-gray transition"><X size={14} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(c)} className="p-1.5 rounded-lg hover:bg-wem-border text-wem-gray hover:text-wem-text transition"><Pencil size={14} /></button>
                        <button onClick={() => setConfirmDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-900/30 text-wem-gray hover:text-red-400 transition"><Trash2 size={14} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setConfirmDelete(null)}>
          <div className="bg-wem-surface border border-wem-border rounded-2xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-wem-text font-semibold mb-1">Supprimer «{clientToDelete?.name}» ?</h3>
            <p className="text-xs text-wem-gray mb-4">Ce client sera supprimé définitivement.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 rounded-xl border border-wem-border text-wem-gray text-sm hover:text-wem-text transition">Annuler</button>
              <button onClick={() => deleteClient(confirmDelete)} className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
