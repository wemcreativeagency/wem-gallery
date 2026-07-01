import { createClient } from "@/lib/supabase/server";
import UploadList from "./UploadList";

export default async function UploadPage() {
  const supabase = await createClient();
  const { data: galleries } = await supabase
    .from("galleries")
    .select("id, name, slug")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-wem-text">Upload</h1>
        <p className="text-wem-gray text-sm mt-1">Ajoutez des m&eacute;dias &agrave; une galerie existante.</p>
      </div>

      {galleries && galleries.length > 0
        ? <UploadList galleries={galleries} />
        : <p className="text-wem-gray text-sm">Cr&eacute;ez d&apos;abord une galerie.</p>
      }
    </div>
  );
}
