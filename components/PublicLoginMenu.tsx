"use client";

import Link from "next/link";

type PublicLoginMenuVariant = "desktop" | "mobile";

export default function PublicLoginMenu({
  variant,
  onNavigate,
}: {
  variant: PublicLoginMenuVariant;
  onNavigate?: () => void;
}) {
  if (variant === "mobile") {
    return (
      <div className="mt-2 rounded-2xl border border-[#d9e5d1] bg-white/70 p-2">
        <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.24em] text-[#7a9a28]">
          Login Dashboard
        </p>
        <div className="flex flex-col gap-1">
          <Link
            href="/pakar?role=pakar"
            onClick={onNavigate}
            className="rounded-xl px-4 py-3 text-sm font-semibold text-[#154212] transition-colors hover:bg-[#eef5e8]"
          >
            Login sebagai Pakar
          </Link>
          <Link
            href="/pakar?role=admin"
            onClick={onNavigate}
            className="rounded-xl px-4 py-3 text-sm font-semibold text-[#154212] transition-colors hover:bg-[#eef5e8]"
          >
            Login sebagai Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <details className="relative hidden md:block">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-[#154212]/12 bg-white/65 px-4 py-2 text-sm font-semibold text-[#154212] shadow-sm transition-colors hover:bg-white">
        Login
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </summary>

      <div className="absolute right-0 top-[calc(100%+10px)] w-56 overflow-hidden rounded-2xl border border-[#d9e5d1] bg-white shadow-[0_18px_40px_rgba(21,66,18,0.12)]">
        <div className="border-b border-[#eef2e8] px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7a9a28]">
            Pilih Peran
          </p>
        </div>
        <div className="p-2">
          <Link
            href="/pakar?role=pakar"
            className="block rounded-xl px-4 py-3 text-sm font-semibold text-[#154212] transition-colors hover:bg-[#eef5e8]"
          >
            Login sebagai Pakar
          </Link>
          <Link
            href="/pakar?role=admin"
            className="block rounded-xl px-4 py-3 text-sm font-semibold text-[#154212] transition-colors hover:bg-[#eef5e8]"
          >
            Login sebagai Admin
          </Link>
        </div>
      </div>
    </details>
  );
}
