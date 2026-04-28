"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";

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
        emailRedirectTo: `${window.location.origin}/auth/callback`,
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 transition-colors shadow-lg">
              <Image
                src="/Logo.png"
                alt="Tugobo AI"
                width={200}
                height={40}
                className="h-[40px] w-auto object-contain"
                priority
              />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
              ⚙️
            </div>
            <h2 className="font-semibold text-slate-900 mb-2">Setup required</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Copy <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">.env.example</code> to{" "}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">apps/web/.env.local</code>{" "}
              and add your Supabase credentials to enable auth.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 transition-colors shadow-lg">
            <Image
              src="/Logo.png"
              alt="Tugobo AI"
              width={200}
              height={40}
              className="h-[40px] w-auto object-contain"
              priority
            />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          {sent ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✉️</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Check your email
              </h2>
              <p className="text-slate-500 text-sm">
                We sent a magic link to <strong>{email}</strong>. Click it to
                sign in.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-slate-900 mb-1">
                Welcome back
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Enter your email to receive a sign-in link
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@hotel.com"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                {error && (
                  <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium text-sm transition-colors"
                >
                  {loading ? "Sending…" : "Send magic link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
