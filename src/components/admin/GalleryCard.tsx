import Link from "next/link";
import Image from "next/image";
import { Gallery } from "@/types";
import { Lock, Globe, Calendar, ChevronRight } from "lucide-react";
import GalleryCardActions from "./GalleryCardActions";

interface Props {
  gallery: Gallery & { client?: { id: string; name: string; email: string; sector?: string | null; started_at?: string | null } };
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function GalleryCard({ gallery }: Props) {
  return (
    <div className="bg-wem-surface border border-wem-border rounded-2xl flex flex-col items-center text-center transition group relative" style={{ aspectRatio: "1/1" }}>

      {/* Visibility badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="flex items-center gap-1 bg-wem-black/70 text-wem-gray text-[10px] px-2 py-1 rounded-full border border-wem-border">
          {gallery.visibility === "public" ? <><Globe size={9} /> Public</> : <><Lock size={9} /> Priv&eacute;</>}
        </span>
      </div>

      {/* Edit + Delete icons */}
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition">
        <GalleryCardActions
          galleryId={gallery.id}
          gallerySlug={gallery.slug}
          galleryName={gallery.name}
          currentCoverImage={gallery.cover_image ?? null}
          clientId={gallery.client_id ?? null}
          clientName={gallery.client?.name ?? ""}
          clientSector={gallery.client?.sector ?? ""}
          clientStartedAt={gallery.client?.started_at ?? ""}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center flex-1 w-full px-3 pt-7 pb-2">
        {/* Avatar */}
        <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-wem-border overflow-hidden bg-wem-black flex items-center justify-center mb-2 flex-shrink-0">
          {gallery.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={gallery.cover_image} alt={gallery.name} className="object-cover w-full h-full" />
          ) : (
            <span className="text-sm md:text-lg font-bold text-wem-text">{initials(gallery.name)}</span>
          )}
        </div>

        {/* Name */}
        <p className="font-bold text-wem-text text-xs md:text-sm leading-tight mb-0.5 text-center line-clamp-2">{gallery.name}</p>

        {/* Client */}
        <p className={`text-[10px] uppercase tracking-wider mb-2 md:mb-3 truncate max-w-full ${gallery.client ? "text-wem-gray" : "text-wem-gray/30"}`}>
          {gallery.client ? gallery.client.name : "Sans client"}
        </p>

        {/* CTA */}
        <Link
          href={`/admin/galleries/${gallery.id}`}
          className="w-full flex items-center justify-center gap-1 border border-wem-border hover:border-wem-red text-wem-text hover:text-wem-red text-[10px] md:text-xs font-medium py-2 rounded-xl transition"
        >
          Accéder <ChevronRight size={10} />
        </Link>
      </div>

      {/* Date */}
      <div className="flex items-center gap-1 pb-3 text-[9px] md:text-[10px] text-wem-gray">
        <Calendar size={8} />
        <span>{new Date(gallery.created_at).toLocaleDateString("fr-FR")}</span>
      </div>
    </div>
  );
}
