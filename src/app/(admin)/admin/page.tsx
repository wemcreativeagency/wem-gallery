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
      <div className="flex items-center justify-between mb-4 md:mb-8">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-wem-text">Dashboard</h1>
          <p className="text-wem-gray text-xs md:text-sm mt-0.5">Vue d&apos;ensemble</p>
        </div>
        <Link
          href="/admin/galleries/new"
          className="flex items-center gap-1.5 bg-wem-red hover:bg-wem-red-dark text-wem-black font-semibold px-3 py-2 rounded-lg text-xs md:text-sm transition"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">Nouvelle galerie</span>
          <span className="sm:hidden">Nouveau</span>
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

      <div className="mt-6 md:mt-10">
        <h2 className="text-sm md:text-lg font-semibold text-wem-text mb-3 md:mb-4">Galeries récentes</h2>
        {recentGalleries && recentGalleries.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
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

