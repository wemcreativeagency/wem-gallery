"use client";

import { useState } from "react";
import UploadZone from "@/components/admin/UploadZone";
import { X } from "lucide-react";

interface Gallery { id: string; name: string; slug: string }

export default function UploadList({ galleries }: { galleries: Gallery[] }) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const visible = galleries.filter((g) => !hidden.has(g.id));

  return (
    <div className="space-y-3">
      {visible.map((g) => (
        <div key={g.id} className="rounded-xl px-4 py-3 relative group">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-wem-text text-sm">{g.name}</h2>
            <button
              onClick={() => setHidden((prev) => new Set([...prev, g.id]))}
              className="p-1 rounded-lg text-wem-gray hover:text-red-400 hover:bg-red-900/20 transition opacity-0 group-hover:opacity-100"
              title="Masquer"
            >
              <X size={14} />
            </button>
          </div>
          <UploadZone galleryId={g.id} gallerySlug={g.slug} />
        </div>
      ))}

      {visible.length === 0 && (
        <div className="text-center py-10 text-wem-gray text-sm">
          <p>Toutes les galeries sont masquées.</p>
          <button onClick={() => setHidden(new Set())} className="text-wem-red hover:underline text-xs mt-1">
            Réafficher tout
          </button>
        </div>
      )}
    </div>
  );
}
