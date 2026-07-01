import { createClient } from "@/lib/supabase/server";
import DashboardStats from "@/components/admin/DashboardStats";
import DashboardBanner from "@/components/admin/DashboardBanner";
import GalleryCard from "@/components/admin/GalleryCard";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: galleryCount },
    { count: clientCount },
    { count: favoriteCount },
    { data: mediaStats },
    { data: recentGalleries },
  ] = await Promise.all([
    supabase.from("galleries").select("*", { count: "exact", head: true }),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("favorites").select("*", { count: "exact", head: true }),
    supabase.from("media").select("type"),
    supabase
      .from("galleries")
      .select("*, client:clients(name, email)")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const photoCount = mediaStats?.filter((m) => m.type === "image").length ?? 0;
  const videoCount = mediaStats?.filter((m) => m.type === "video").length ?? 0;
  const documentCount = mediaStats?.filter((m) => m.type === "document").length ?? 0;

  return (
    <div>
      <DashboardBanner />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-wem-text">Dashboard</h1>
          <p className="text-wem-gray text-sm mt-1">Vue d&apos;ensemble de We.m Gallery</p>
        </div>
        <Link
          href="/admin/galleries/new"
          className="flex items-center gap-2 bg-wem-red hover:bg-wem-red-dark text-wem-black font-semibold px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Plus size={16} />
          Nouvelle galerie
        </Link>
      </div>

      <DashboardStats
        galleries={galleryCount ?? 0}
        photos={photoCount}
        videos={videoCount}
        documents={documentCount}
        clients={clientCount ?? 0}
        favorites={favoriteCount ?? 0}
      />

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-wem-text mb-4">Galeries récentes</h2>
        {recentGalleries && recentGalleries.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {recentGalleries.map((gallery) => (
              <GalleryCard key={gallery.id} gallery={gallery as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-wem-gray">
            <p>Aucune galerie pour l&apos;instant.</p>
            <Link href="/admin/galleries/new" className="text-wem-red hover:underline text-sm mt-2 inline-block">
              Créer votre première galerie â†’
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

