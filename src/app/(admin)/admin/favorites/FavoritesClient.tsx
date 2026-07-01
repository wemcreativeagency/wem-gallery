"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Star, Video, Folder, FolderOpen, X, ChevronRight, MessageSquare, Trash2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type MediaItem = {
  id: string; url: string; thumbnail_url: string | null;
  type: string; filename: string; interacted_at: string; session_id: string;
};
type GalleryData = { id: string; name: string; slug: string; likes: MediaItem[]; favorites: MediaItem[] };
type SessionData = { id: string; clientName: string; clientEmail: string; isUnknown: boolean; galleries: GalleryData[] };
type Comment = { session_id: string; content: string; created_at: string };
interface Props { sessions: SessionData[]; commentsByMedia: Record<string, Comment[]> }
interface PreviewItem { media: MediaItem; comments: Comment[]; badge: "like" | "favori" }

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function FavoritesClient({ sessions: init, commentsByMedia: initComments }: Props) {
  const [sessions, setSessions] = useState(init);
  const [commentsByMedia, setCommentsByMedia] = useState(initComments);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [preview, setPreview] = useState<PreviewItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const supabase = createClient();

  function toggle(id: string) {
    setOpenFolders((p) => ({ ...p, [id]: !p[id] }));
  }

  async function deleteLike(sessionId: string, mediaId: string, clientId: string) {
    await supabase.from("likes").delete().eq("session_id", sessionId).eq("media_id", mediaId);
    setSessions((prev) => prev.map((s) => s.id !== clientId ? s : {
      ...s, galleries: s.galleries.map((g) => ({ ...g, likes: g.likes.filter((m) => m.id !== mediaId) })),
    }));
    if (preview?.media.id === mediaId) setPreview(null);
  }

  async function deleteFavorite(sessionId: string, mediaId: string, clientId: string) {
    await supabase.from("favorites").delete().eq("session_id", sessionId).eq("media_id", mediaId);
    setSessions((prev) => prev.map((s) => s.id !== clientId ? s : {
      ...s, galleries: s.galleries.map((g) => ({ ...g, favorites: g.favorites.filter((m) => m.id !== mediaId) })),
    }));
    if (preview?.media.id === mediaId) setPreview(null);
  }

  async function deleteComment(mediaId: string, index: number) {
    const c = (commentsByMedia[mediaId] ?? [])[index];
    if (!c) return;
    await supabase.from("comments").delete().eq("media_id", mediaId).eq("session_id", c.session_id).eq("content", c.content);
    const updated = { ...commentsByMedia, [mediaId]: commentsByMedia[mediaId].filter((_, i) => i !== index) };
    setCommentsByMedia(updated);
    if (preview?.media.id === mediaId) setPreview((p) => p ? { ...p, comments: updated[mediaId] } : null);
  }

  async function deleteClientFolder(clientId: string) {
    const session = sessions.find((s) => s.id === clientId);
    if (!session) return;
    const sids = new Set<string>();
    session.galleries.forEach((g) => {
      g.likes.forEach((m) => sids.add(m.session_id));
      g.favorites.forEach((m) => sids.add(m.session_id));
    });
    await Promise.all([...sids].flatMap((sid) => [
      supabase.from("likes").delete().eq("session_id", sid),
      supabase.from("favorites").delete().eq("session_id", sid),
      supabase.from("comments").delete().eq("session_id", sid),
      supabase.from("selections").delete().eq("session_id", sid),
    ]));
    setSessions((prev) => prev.filter((s) => s.id !== clientId));
    setConfirmDelete(null);
    setPreview(null);
  }

  if (sessions.length === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-wem-text">Favoris &amp; Likes Clients</h1>
          <p className="text-wem-gray text-sm mt-1">0 client</p>
        </div>
        <div className="text-center py-20 text-wem-gray">
          <Star size={40} className="mx-auto mb-3 opacity-20" />
          <p>Aucune interaction client pour l&apos;instant.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-wem-text">Favoris &amp; Likes Clients</h1>
        <p className="text-wem-gray text-sm mt-1">{sessions.length} client(s)</p>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => {
          const isOpen = !!openFolders[session.id];
          const totalLikes = session.galleries.reduce((a, g) => a + g.likes.length, 0);
          const totalFavs = session.galleries.reduce((a, g) => a + g.favorites.length, 0);
          const allDates = session.galleries.flatMap((g) => [
            ...g.likes.map((m) => m.interacted_at),
            ...g.favorites.map((m) => m.interacted_at),
          ]).sort().reverse();
          const lastSeen = allDates[0] ? fmt(allDates[0]) : null;

          return (
            <div key={session.id} className="bg-wem-surface rounded-xl border border-wem-border overflow-hidden">
              <div className="flex items-center px-6 py-4 hover:bg-wem-black/30 transition">
                <button onClick={() => toggle(session.id)} className="flex-1 flex items-center gap-3 text-left min-w-0">
                  {isOpen
                    ? <FolderOpen size={20} className={session.isUnknown ? "text-wem-gray flex-shrink-0" : "text-wem-red flex-shrink-0"} />
                    : <Folder size={20} className={session.isUnknown ? "text-wem-gray flex-shrink-0" : "text-wem-red flex-shrink-0"} />
                  }
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-wem-text font-semibold truncate">{session.clientName}</p>
                      {session.clientEmail && <span className="text-xs text-wem-gray hidden sm:block">{session.clientEmail}</span>}
                    </div>
                    {lastSeen && <p className="text-[11px] text-wem-gray mt-0.5">Derni&egrave;re activit&eacute; : {lastSeen}</p>}
                  </div>
                </button>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <span className="flex items-center gap-1 text-xs bg-wem-black/50 px-2 py-1 rounded-full border border-wem-border">
                    <Heart size={10} fill="#EBB705" className="text-wem-red" />
                    <span className="text-wem-text font-medium">{totalLikes}</span>
                  </span>
                  <span className="flex items-center gap-1 text-xs bg-wem-black/50 px-2 py-1 rounded-full border border-wem-border">
                    <Star size={10} fill="#EBB705" className="text-wem-red" />
                    <span className="text-wem-text font-medium">{totalFavs}</span>
                  </span>
                  <button onClick={() => setConfirmDelete(session.id)}
                    className="p-1.5 rounded-lg hover:bg-red-900/30 text-wem-gray hover:text-red-400 transition">
                    <Trash2 size={14} />
                  </button>
                  <button onClick={() => toggle(session.id)}>
                    <ChevronRight size={16} className={`text-wem-gray transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-wem-border divide-y divide-wem-border">
                  {session.galleries.map((gallery) => (
                    <div key={gallery.id} className="px-6 py-5">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm font-semibold text-wem-text">{gallery.name}</span>
                        <a href={`/g/${gallery.slug}`} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-wem-gray hover:text-wem-red transition">&#8599;</a>
                      </div>
                      {gallery.likes.length > 0 && (
                        <div className="mb-5">
                          <p className="text-xs text-wem-gray uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Heart size={10} fill="#EBB705" className="text-wem-red" /> Lik&eacute;s ({gallery.likes.length})
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {gallery.likes.map((m, i) => (
                              <Thumb key={`${m.id}-${i}`} media={m} badge="like"
                                commentCount={commentsByMedia[m.id]?.length ?? 0}
                                onOpen={() => setPreview({ media: m, comments: commentsByMedia[m.id] ?? [], badge: "like" })}
                                onDelete={() => deleteLike(m.session_id, m.id, session.id)} />
                            ))}
                          </div>
                        </div>
                      )}
                      {gallery.favorites.length > 0 && (
                        <div>
                          <p className="text-xs text-wem-gray uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Star size={10} fill="#EBB705" className="text-wem-red" /> Favoris ({gallery.favorites.length})
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {gallery.favorites.map((m, i) => (
                              <Thumb key={`${m.id}-${i}`} media={m} badge="favori"
                                commentCount={commentsByMedia[m.id]?.length ?? 0}
                                onOpen={() => setPreview({ media: m, comments: commentsByMedia[m.id] ?? [], badge: "favori" })}
                                onDelete={() => deleteFavorite(m.session_id, m.id, session.id)} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirm */}
      {confirmDelete && (() => {
        const s = sessions.find((x) => x.id === confirmDelete);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setConfirmDelete(null)}>
            <div className="bg-wem-surface border border-wem-border rounded-2xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={18} className="text-red-400" />
                </div>
                <div>
                  <h3 className="text-wem-text font-semibold">Vider &laquo;{s?.clientName}&raquo; ?</h3>
                  <p className="text-xs text-wem-gray mt-0.5">Likes, favoris, commentaires et s&eacute;lections supprim&eacute;s.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 rounded-lg border border-wem-border text-wem-gray text-sm transition hover:text-wem-text">Annuler</button>
                <button onClick={() => deleteClientFolder(confirmDelete)} className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition">Vider</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Preview */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setPreview(null)}>
          <div className="flex bg-wem-surface border border-wem-border rounded-2xl overflow-hidden max-w-5xl w-full mx-4 max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex-1 bg-wem-black flex items-center justify-center min-h-[400px] relative">
              {preview.media.type === "video"
                ? <video src={preview.media.url} controls className="max-w-full max-h-[85vh] object-contain" />
                : <Image src={preview.media.url} alt={preview.media.filename} fill className="object-contain" />}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                <span className="flex items-center gap-1 bg-black/70 text-xs px-2 py-1 rounded-full border border-wem-border">
                  {preview.badge === "like"
                    ? <><Heart size={10} fill="#EBB705" className="text-wem-red" /><span className="text-wem-text">Lik&eacute;</span></>
                    : <><Star size={10} fill="#EBB705" className="text-wem-red" /><span className="text-wem-text">Favori</span></>}
                </span>
                <span className="text-[10px] bg-black/70 px-2 py-1 rounded-full border border-wem-border text-wem-gray">{fmt(preview.media.interacted_at)}</span>
              </div>
              <div className="absolute top-3 right-3 flex gap-2">
                <button onClick={() => deleteLike(preview.media.session_id, preview.media.id, "")}
                  className="flex items-center gap-1 bg-black/70 hover:bg-red-900/60 border border-wem-border hover:border-red-600 px-2 py-1 rounded-full text-xs text-wem-gray hover:text-red-400 transition">
                  <Heart size={9} /> Retirer like
                </button>
                <button onClick={() => deleteFavorite(preview.media.session_id, preview.media.id, "")}
                  className="flex items-center gap-1 bg-black/70 hover:bg-red-900/60 border border-wem-border hover:border-red-600 px-2 py-1 rounded-full text-xs text-wem-gray hover:text-red-400 transition">
                  <Star size={9} /> Retirer favori
                </button>
              </div>
            </div>
            <div className="w-72 flex flex-col border-l border-wem-border">
              <div className="flex items-center justify-between px-4 py-3 border-b border-wem-border">
                <h3 className="text-sm font-semibold text-wem-text flex items-center gap-2">
                  <MessageSquare size={14} className="text-wem-gray" /> Commentaires ({preview.comments.length})
                </h3>
                <button onClick={() => setPreview(null)} className="p-1 rounded hover:bg-wem-border transition">
                  <X size={16} className="text-wem-gray" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {preview.comments.length === 0
                  ? <p className="text-wem-gray text-xs text-center py-6">Aucun commentaire</p>
                  : preview.comments.map((c, i) => (
                    <div key={i} className="bg-wem-black rounded-lg px-3 py-2 border border-wem-border group relative">
                      <p className="text-wem-text text-sm pr-5">{c.content}</p>
                      <p className="text-wem-gray text-[10px] mt-1">{fmt(c.created_at)}</p>
                      <button onClick={() => deleteComment(preview.media.id, i)}
                        className="absolute top-2 right-2 p-0.5 rounded hover:bg-red-900/40 text-wem-gray/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
              </div>
              <div className="px-4 py-3 border-t border-wem-border">
                <p className="text-wem-gray text-xs truncate">{preview.media.filename}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Thumb({ media, badge, commentCount, onOpen, onDelete }: {
  media: MediaItem; badge: "like" | "favori";
  commentCount: number; onOpen: () => void; onDelete: () => void;
}) {
  return (
    <div className="relative flex-shrink-0 group/t">
      <button onClick={onOpen} className="block rounded-xl overflow-hidden border border-wem-border hover:border-wem-red transition">
        <div className="relative w-[88px] h-[88px]">
          <Image src={media.thumbnail_url || media.url} alt={media.filename} fill className="object-cover group-hover/t:scale-105 transition-transform" />
          {media.type === "video" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40"><Video size={14} className="text-white" /></div>
          )}
          <div className="absolute top-1 right-1">
            {badge === "like" ? <Heart size={10} fill="#EBB705" className="text-wem-red drop-shadow" /> : <Star size={10} fill="#EBB705" className="text-wem-red drop-shadow" />}
          </div>
          {commentCount > 0 && <div className="absolute top-1 left-1"><MessageSquare size={9} className="text-white drop-shadow" /></div>}
        </div>
        <div className="bg-wem-black/80 px-1 py-1 text-center">
          <p className="text-[9px] text-wem-gray leading-tight">{fmt(media.interacted_at)}</p>
        </div>
      </button>
      <button onClick={onDelete}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 hover:bg-red-500 rounded-full hidden group-hover/t:flex items-center justify-center shadow-lg z-10 transition">
        <X size={10} className="text-white" />
      </button>
    </div>
  );
}
