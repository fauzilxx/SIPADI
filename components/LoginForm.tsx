"use client";

import Link from "next/link";
import { useState } from "react";

type PreferredDashboardRole = "pakar" | "admin";

export default function LoginForm({
  preferredRole = "pakar",
}: {
  preferredRole?: PreferredDashboardRole;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/pakar/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (!response.ok || !payload.success) {
        setErrorMessage(payload.message ?? "Login gagal.");
        setLoading(false);
        return;
      }

      window.location.reload();
    } catch {
      setErrorMessage("Tidak dapat terhubung ke server login.");
      setLoading(false);
    }
  }

  function handleBack() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = "/";
  }

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/30 bg-white/55 p-8 shadow-[0_24px_60px_rgba(21,66,18,0.12)] backdrop-blur-xl sm:p-10">
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#BAD36F]/35 blur-2xl" />
      <div className="absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-[#154212]/10 blur-3xl" />

      <div className="relative">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-full border border-[#d9e5d1] bg-white/80 px-4 py-2 text-sm font-semibold text-[#154212] transition hover:bg-[#f4f8ef]"
          >
            Kembali
          </button>
          <Link
            href="/"
            className="text-sm font-semibold text-[#7a9a28] transition hover:text-[#154212]"
          >
            Kembali ke Beranda
          </Link>
        </div>

        <div className="mb-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#7a9a28]">
            Dashboard Access
          </p>
          <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-[#154212]">
            Dashboard Pakar dan Admin SIPADI
          </h1>
          <p className="mb-3 inline-flex rounded-full bg-[#eef5e8] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#154212]">
            Mode Login {preferredRole}
          </p>
          <p className="max-w-xl text-sm leading-relaxed text-gray-600">
            Masuk sesuai peran Anda. Pakar mengajukan usulan perubahan knowledge
            base, sedangkan admin mereview feedback petani, menyetujui usulan
            pakar, dan mengelola basis pengetahuan.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <input
            type="text"
            name="fake-username"
            autoComplete="username"
            tabIndex={-1}
            aria-hidden="true"
            className="hidden"
          />
          <input
            type="password"
            name="fake-password"
            autoComplete="current-password"
            tabIndex={-1}
            aria-hidden="true"
            className="hidden"
          />
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#154212]">
              Username
            </label>
            <input
              name="sipadi-login-id"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              className="w-full rounded-2xl border border-[#d9e5d1] bg-white/80 px-4 py-3 text-sm text-[#154212] outline-none transition focus:border-[#7a9a28] focus:ring-2 focus:ring-[#BAD36F]/40"
              placeholder="Masukkan username pakar atau admin"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#154212]">
              Password
            </label>
            <input
              type="password"
              name="sipadi-login-secret"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-[#154212] outline-none transition focus:ring-2 ${
                errorMessage
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "border-[#d9e5d1] focus:border-[#7a9a28] focus:ring-[#BAD36F]/40"
              }`}
              placeholder="Masukkan password sesuai peran"
            />
          </div>

          {errorMessage && (
            <div className="animate-fade-in rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-[#154212] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#12370f] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Memeriksa kredensial..." : "Masuk ke Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
