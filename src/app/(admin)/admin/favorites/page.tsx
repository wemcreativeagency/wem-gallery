import { createClient } from "@/lib/supabase/server";
import FavoritesClient from "./FavoritesClient";

export default async function FavoritesPage() {
  const supabase = await createClient();

  const [{ data: allClients }, { data: likes }, { data: favorites }, { data: comments }] = await Promise.all([
    supabase.from("clients").select("id, name, email, created_at").order("name"),
    supabase
      .from("likes")
      .select("session_id, created_at, media:media(id, url, thumbnail_url, type, filename, gallery:galleries(id, name, slug, client_id))")
      .order("created_at", { ascending: false }),
    supabase
      .from("favorites")
      .select("session_id, created_at, media:media(id, url, thumbnail_url, type, filename, gallery:galleries(id, name, slug, client_id))")
      .order("created_at", { ascending: false }),
    supabase
      .from("comments")
      .select("media_id, session_id, content, created_at")
      .order("created_at", { ascending: true }),
  ]);

  type GalleryInfo = { id: string; name: string; slug: string; client_id: string | null } | null;
  type MediaItem = { id: string; url: string; thumbnail_url: string | null; type: string; filename: string; gallery: GalleryInfo };
  type MediaWithMeta = { id: string; url: string; thumbnail_url: string | null; type: string; filename: string; interacted_at: string; session_id: string };
  type GalleryBucket = { name: string; slug: string; likes: MediaWithMeta[]; favorites: MediaWithMeta[] };
  // Keyed by client_id (or "unknown" for galleries without client)
  type ClientBucket = { galleries: Record<string, GalleryBucket> };

  const byClient: Record<string, ClientBucket> = {};

  function addRow(rows: any[], bucket: "likes" | "favorites") {
    for (const row of rows ?? []) {
      const m = row.media as MediaItem;
      if (!m?.gallery) continue;
      // Key by the gallery's client_id, fallback to "unknown"
      const cid = m.gallery.client_id ?? "unknown";
      if (!byClient[cid]) byClient[cid] = { galleries: {} };
      const gid = m.gallery.id;
      if (!byClient[cid].galleries[gid])
        byClient[cid].galleries[gid] = { name: m.gallery.name, slug: m.gallery.slug, likes: [], favorites: [] };
      const already = byClient[cid].galleries[gid][bucket].some((x) => x.id === m.id);
      if (!already)
        byClient[cid].galleries[gid][bucket].push({
          id: m.id, url: m.url, thumbnail_url: m.thumbnail_url,
          type: m.type, filename: m.filename,
          interacted_at: row.created_at,
          session_id: row.session_id,
        });
    }
  }

  addRow(likes ?? [], "likes");
  addRow(favorites ?? [], "favorites");

  const commentsByMedia: Record<string, { session_id: string; content: string; created_at: string }[]> = {};
  for (const c of comments ?? []) {
    if (!commentsByMedia[c.media_id]) commentsByMedia[c.media_id] = [];
    commentsByMedia[c.media_id].push({ session_id: c.session_id, content: c.content, created_at: c.created_at });
  }

  // Build client list: all registered clients first, then "unknown" if any
  const clientMap = Object.fromEntries((allClients ?? []).map((c) => [c.id, c]));

  const sessions = [
    // Registered clients (show even if no activity yet? No — only if they have interactions)
    ...(allClients ?? [])
      .filter((c) => byClient[c.id])
      .map((c) => ({
        id: c.id,
        clientName: c.name,
        clientEmail: c.email,
        isUnknown: false,
        galleries: Object.entries(byClient[c.id].galleries).map(([gid, g]) => ({ id: gid, ...g })),
      })),
    // Unknown (galleries without client assigned)
    ...(byClient["unknown"]
      ? [{
          id: "unknown",
          clientName: "Galeries sans client",
          clientEmail: "",
          isUnknown: true,
          galleries: Object.entries(byClient["unknown"].galleries).map(([gid, g]) => ({ id: gid, ...g })),
        }]
      : []),
  ];

  return (
    <FavoritesClient sessions={sessions} commentsByMedia={commentsByMedia} />
  );
}
