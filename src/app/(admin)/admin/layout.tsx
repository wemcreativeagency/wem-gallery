import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/Sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-wem-bg">
      <AdminSidebar />
      {/* Desktop: ml-64, Mobile: no margin + bottom padding for nav bar */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8">{children}</main>
    </div>
  );
}
