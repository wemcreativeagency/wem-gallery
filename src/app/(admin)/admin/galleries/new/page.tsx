import { createClient } from "@/lib/supabase/server";
import NewGalleryForm from "@/components/admin/NewGalleryForm";
import NewGalleryModal from "./NewGalleryModal";

export default async function NewGalleryPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase.from("clients").select("id, name, email, created_at").order("name");

  return (
    <NewGalleryModal>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-wem-text">Nouvelle galerie</h1>
        <p className="text-wem-gray text-sm mt-1">Créez une galerie et partagez-la avec votre client.</p>
      </div>
      <NewGalleryForm clients={clients ?? []} />
    </NewGalleryModal>
  );
}
