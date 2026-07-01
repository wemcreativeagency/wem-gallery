import Image from "next/image";
import { Star, Download } from "lucide-react";

interface Props {
  selections: any[];
}

export default function ClientFavorites({ selections }: Props) {
  if (selections.length === 0) {
    return (
      <div className="text-center py-20 text-wem-gray">
        <Star size={40} className="mx-auto mb-3 opacity-20" />
        <p>Aucune sélection envoyée pour l&apos;instant.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selections.map((sel) => (
        <div key={sel.id} className="bg-wem-surface rounded-xl border border-wem-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-wem-text">{sel.gallery?.name}</h3>
              <p className="text-xs text-wem-gray mt-0.5">
                Envoyée le {new Date(sel.sent_at).toLocaleDateString("fr-FR", {
                  day: "numeric", month: "long", year: "numeric"
                })}
              </p>
              {sel.message && (
                <p className="text-sm text-wem-text mt-2 italic">&ldquo;{sel.message}&rdquo;</p>
              )}
            </div>
            <span className="bg-wem-red/10 text-wem-red text-xs font-medium px-3 py-1 rounded-full">
              {sel.media_ids?.length ?? 0} médias
            </span>
          </div>

          {/* Media thumbnails */}
          <div className="flex flex-wrap gap-2">
            {sel.media?.slice(0, 12).map((m: any) => (
              <div key={m.id} className="w-16 h-16 rounded-lg overflow-hidden bg-wem-bg relative">
                <Image
                  src={m.thumbnail_url || m.url}
                  alt={m.filename}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
            {(sel.media?.length ?? 0) > 12 && (
              <div className="w-16 h-16 rounded-lg bg-wem-bg flex items-center justify-center text-xs text-wem-gray">
                +{sel.media.length - 12}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
