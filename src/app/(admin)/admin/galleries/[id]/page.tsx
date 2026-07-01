import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import SharePanel from "@/components/admin/SharePanel";
import GalleryClientAssign from "@/components/admin/GalleryClientAssign";
import GalleryDetailClient from "./GalleryDetailClient";
import { ExternalLink } from "lucide-react";

export default async function GalleryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: gallery }, { data: clients }] = await Promise.all([
    supabase.from("galleries").select("*, client:clients(id, name, email), media(*)").eq("id", id).single(),
    supabase.from("clients").select("id, name, email, created_at").order("name"),
  ]);

  if (!gallery) notFound();

  const galleryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/g/${gallery.slug}`;

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-wem-text">{gallery.name}</h1>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <GalleryClientAssign
              galleryId={gallery.id}
              currentClientId={gallery.client_id ?? null}
              clients={clients ?? []}
            />
            <span className="text-wem-gray text-xs">{gallery.media?.length ?? 0} média(s)</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={galleryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-wem-gray/30 text-wem-gray hover:text-wem-text hover:border-wem-text px-3 py-2 rounded-lg text-sm transition"
          >
            <ExternalLink size={14} />
            Voir
          </a>
          <SharePanel galleryUrl={galleryUrl} gallerySlug={gallery.slug} />
        </div>
      </div>

      <GalleryDetailClient
        galleryId={gallery.id}
        gallerySlug={gallery.slug}
        initialMedia={gallery.media ?? []}
      />
    </div>
  );
}
