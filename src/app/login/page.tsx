"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [forgotSent, setForgotSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (mode === "forgot") {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) {
        setError("Erreur lors de l'envoi. Vérifiez l'email.");
      } else {
        setForgotSent(true);
      }
      setLoading(false);
      return;
    }

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/studio.jpg"
          alt="We.m Studio"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="rounded-2xl p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="We.m logo"
              className="w-24 h-24 object-contain -mr-1"
              style={{ mixBlendMode: "screen" }}
            />
            <div>
              <span className="text-2xl font-bold text-white tracking-tight">
                we<span className="text-wem-red">.</span>m
              </span>
              <p className="text-white/50 text-xs mt-0.5">Gallery Admin</p>
            </div>
          </div>

          {forgotSent ? (
            <div className="text-center space-y-4">
              <p className="text-white text-sm">Un email de réinitialisation a été envoyé à <strong>{email}</strong>.</p>
              <button
                onClick={() => { setMode("login"); setForgotSent(false); }}
                className="text-wem-red text-sm hover:underline"
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/10 text-white placeholder-white/40 border border-white/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-wem-red transition"
              />

              {mode === "login" && (
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/10 text-white placeholder-white/40 border border-white/15 rounded-lg px-4 py-3 pr-11 text-sm focus:outline-none focus:border-wem-red transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              )}

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-wem-red hover:bg-wem-red-dark text-wem-black font-semibold py-3 rounded-lg transition disabled:opacity-50 mt-1"
              >
                {loading ? "..." : mode === "login" ? "Se connecter" : "Envoyer le lien"}
              </button>

              <div className="text-center pt-1">
                {mode === "login" ? (
                  <button
                    type="button"
                    onClick={() => { setMode("forgot"); setError(""); }}
                    className="text-white/40 hover:text-white text-xs transition"
                  >
                    Mot de passe oublié ?
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setMode("login"); setError(""); }}
                    className="text-white/40 hover:text-white text-xs transition"
                  >
                    Retour à la connexion
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
