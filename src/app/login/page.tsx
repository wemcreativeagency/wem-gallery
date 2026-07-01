"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/studio.jpg"
          alt="We.m Studio"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px]" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="rounded-2xl p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <Image
              src="/logo.png"
              alt="We.m logo"
              width={96}
              height={96}
              className="object-contain -mr-1"
              style={{ mixBlendMode: "screen" }}
            />
            <div>
              <span className="text-2xl font-bold text-white tracking-tight">
                we<span className="text-wem-red">.</span>m
              </span>
              <p className="text-white/50 text-xs mt-0.5">Gallery Admin</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/10 text-white placeholder-white/40 border border-white/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-wem-red transition"
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/10 text-white placeholder-white/40 border border-white/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-wem-red transition"
            />

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-wem-red hover:bg-wem-red-dark text-wem-black font-semibold py-3 rounded-lg transition disabled:opacity-50 mt-1"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
