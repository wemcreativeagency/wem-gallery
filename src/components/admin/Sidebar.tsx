"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Images,
  Upload,
  Users,
  Star,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Clients", href: "/admin/clients", icon: Users },
  { label: "Galeries", href: "/admin/galleries", icon: Images },
  { label: "Upload", href: "/admin/upload", icon: Upload },
  { label: "Favoris Clients", href: "/admin/favorites", icon: Star },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-wem-black flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10 flex items-center gap-3">
        <Image src="/logo.png" alt="We.m" width={80} height={80} className="object-contain flex-shrink-0 -mr-1" style={{ mixBlendMode: "screen" }} />
        <div>
          <span className="text-lg font-bold text-white tracking-tight leading-none">
            we<span className="text-wem-red">.</span>m
          </span>
          <p className="text-white/40 text-[11px] leading-none mt-0.5">gallery</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ label, href, icon: Icon }) => {
          const active =
            href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition",
                active
                  ? "bg-wem-red text-wem-black font-semibold"
                  : "text-white/60 hover:text-white hover:bg-wem-surface/5"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link
          href="/admin/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-wem-surface/5 transition"
        >
          <Settings size={18} />
          Paramètres
        </Link>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-wem-surface/5 transition"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
