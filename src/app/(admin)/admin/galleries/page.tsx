import { createClient } from "@/lib/supabase/server";
import GalleryCard from "@/components/admin/GalleryCard";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function GalleriesPage() {
  const supabase = await createClient();
  const { data: galleries } = await supabase
    .from("galleries")
    .select("*, client:clients(id, name, email)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-wem-text">Galeries</h1>
          <p className="text-wem-gray text-sm mt-1">{galleries?.length ?? 0} galerie(s)</p>
        </div>
        <Link
          href="/admin/galleries/new"
          className="flex items-center gap-2 bg-wem-red hover:bg-wem-red-dark text-wem-black font-semibold px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Plus size={16} />
          Nouvelle galerie
        </Link>
      </div>

      {galleries && galleries.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {galleries.map((gallery) => (
            <GalleryCard key={gallery.id} gallery={gallery as any} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-wem-gray">
          <p className="text-lg">Aucune galerie créée.</p>
          <Link href="/admin/galleries/new" className="text-wem-red hover:underline text-sm mt-2 inline-block">
            Créer la première â†’
          </Link>
        </div>
      )}
    </div>
  );
}

