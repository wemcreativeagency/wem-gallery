import { createClient } from "@/lib/supabase/server";
import ClientsTable from "@/components/admin/ClientsTable";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-wem-text">Clients</h1>
        <p className="text-wem-gray text-sm mt-1">{clients?.length ?? 0} client(s) enregistré(s)</p>
      </div>
      <ClientsTable clients={clients ?? []} />
    </div>
  );
}
