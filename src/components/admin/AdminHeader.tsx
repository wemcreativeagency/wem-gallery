"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Camera,
  Trash2,
  Lock,
  CalendarDays,
  CheckSquare,
  MessageSquare,
  Search,
  UserPlus,
  LogOut,
  Plus,
} from "lucide-react";

interface Props {
  userEmail?: string;
  userName?: string;
}

function getInitials(name?: string, email?: string) {
  if (name) {
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "WM";
}

export default function AdminHeader({ userEmail, userName }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const initials = getInitials(userName, userEmail);
  const displayName = userName || userEmail?.split("@")[0] || "Admin";

  return (
    <header className="fixed top-0 left-64 right-0 z-30 h-14 bg-wem-bg border-b border-wem-border flex items-center justify-end px-6 gap-3">
      {/* Nouveau client */}
      <button
        onClick={() => router.push("/admin/clients")}
        className="flex items-center gap-1.5 bg-wem-red text-wem-black text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition"
      >
        <Plus size={14} />
        Nouveau client
      </button>

      {/* Profile */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          <span className="text-wem-gray text-sm hidden sm:block">{displayName}</span>
          <div className="w-8 h-8 rounded-full bg-wem-red flex items-center justify-center text-wem-black text-xs font-bold">
            {initials}
          </div>
        </button>

        {open && (
          <div className="absolute right-0 top-11 w-56 bg-wem-surface border border-wem-border rounded-xl shadow-2xl overflow-hidden z-50">
            {/* Identity */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-wem-border">
              <div className="w-9 h-9 rounded-full bg-wem-red flex items-center justify-center text-wem-black text-sm font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-wem-text text-sm font-semibold truncate">{displayName}</p>
                <p className="text-wem-gray text-[11px] truncate">admin</p>
              </div>
            </div>

            {/* Profil */}
            <div className="px-2 py-1.5">
              <p className="text-wem-gray text-[10px] font-semibold uppercase tracking-wider px-2 py-1">Profil</p>
              <MenuItem icon={User} label="Mon profil" onClick={() => { setOpen(false); router.push("/admin/settings"); }} />
              <MenuItem icon={Camera} label="Changer la photo" onClick={() => setOpen(false)} />
              <MenuItem icon={Trash2} label="Supprimer la photo" onClick={() => setOpen(false)} danger />
              <MenuItem icon={Lock} label="Changer mon mot de passe" onClick={() => setOpen(false)} />
            </div>

            <div className="border-t border-wem-border" />

            {/* Espace */}
            <div className="px-2 py-1.5">
              <p className="text-wem-gray text-[10px] font-semibold uppercase tracking-wider px-2 py-1">Espace</p>
              <MenuItem icon={CalendarDays} label="Mon calendrier" onClick={() => setOpen(false)} />
              <MenuItem icon={CheckSquare} label="Mes tâches" onClick={() => setOpen(false)} />
              <MenuItem icon={MessageSquare} label="Messages" onClick={() => setOpen(false)} />
              <MenuItem icon={Search} label="Recherche globale" onClick={() => setOpen(false)} />
            </div>

            <div className="border-t border-wem-border" />

            {/* Équipe */}
            <div className="px-2 py-1.5">
              <p className="text-wem-gray text-[10px] font-semibold uppercase tracking-wider px-2 py-1">Équipe</p>
              <MenuItem icon={UserPlus} label="Inviter un membre" onClick={() => setOpen(false)} />
            </div>

            <div className="border-t border-wem-border" />

            <div className="px-2 py-1.5">
              <MenuItem icon={LogOut} label="Déconnexion" onClick={signOut} danger />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition ${
        danger
          ? "text-red-400 hover:bg-red-900/20"
          : "text-wem-text hover:bg-wem-border/40"
      }`}
    >
      <Icon size={15} className="flex-shrink-0 opacity-70" />
      {label}
    </button>
  );
}
