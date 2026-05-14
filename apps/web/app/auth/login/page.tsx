"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";

function magicLinkCallbackUrl(): string {
  if (typeof window === "undefined") {
    return "/auth/callback";
  }
  const origin = window.location.origin;
  const next = new URLSearchParams(window.location.search).get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return `${origin}/auth/callback`;
  }
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured. Add your keys to .env.local to enable auth.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: magicLinkCallbackUrl(),
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  if (!supabaseConfigured()) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.35), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(99, 102, 241, 0.2), transparent 50%)",
          }}
        />
        <div className="relative z-10 w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-white/[0.08] bg-zinc-900/80 px-5 py-3 shadow-lg shadow-black/40 backdrop-blur transition-colors hover:bg-zinc-900"
            >
              <Image
                src="/Logo.png"
                alt="Tugobo AI"
                width={200}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-8 text-center shadow-xl shadow-black/50 backdrop-blur-md">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-lg">
              ⚙️
            </div>
            <h2 className="text-lg font-semibold text-white">Setup required</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/50">
              Copy <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs text-white/70">
                .env.example
              </code>{" "}
              to{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs text-white/70">
                apps/web/.env.local
              </code>{" "}
              and add your Supabase credentials to enable auth.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-12 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 50% -15%, rgba(37, 99, 235, 0.45), transparent 55%), radial-gradient(ellipse 50% 35% at 100% 10%, rgba(79, 70, 229, 0.25), transparent 45%), radial-gradient(ellipse 45% 30% at 0% 20%, rgba(14, 165, 233, 0.2), transparent 40%)",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-10 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-white/[0.08] bg-zinc-900/70 px-6 py-3 shadow-lg shadow-black/40 backdrop-blur transition-colors hover:border-white/[0.12] hover:bg-zinc-900"
          >
            <Image
              src="/Logo.png"
              alt="Tugobo AI"
              width={200}
              height={40}
              className="h-10 w-auto object-contain [filter:drop-shadow(0_0_14px_rgba(255,255,255,0.06))]"
              priority
            />
          </Link>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/55 p-8 shadow-2xl shadow-black/50 backdrop-blur-md md:p-9">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-2xl">
                ✉️
              </div>
              <h2 className="text-lg font-semibold tracking-tight text-white">Check your email</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/50">
                We sent a secure magic link to{" "}
                <span className="font-medium text-white/80">{email}</span>. Open it on this device to
                enter your operations workspace.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold tracking-tight text-white">Sign in</h2>
              <p className="mt-1.5 text-sm text-white/45">
                Hotel operations console — magic link, no passwords on file.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label htmlFor="email" className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/40">
                    Work email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@hotel.com"
                    className="w-full rounded-xl border border-white/[0.1] bg-zinc-950/60 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none ring-0 transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/25"
                  />
                </div>

                {error ? (
                  <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-sm text-red-200/90">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {loading ? "Sending link…" : "Email me a magic link"}
                </button>
              </form>

              <p className="mt-8 text-center text-xs text-white/35">
                By continuing you agree to operational access policies for your organization.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
