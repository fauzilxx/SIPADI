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
      <Link
        href="/pakar"
        onClick={onNavigate}
        className="mt-2 block rounded-2xl border border-[#d9e5d1] bg-white/70 px-4 py-3 text-sm font-semibold text-[#154212] transition-colors hover:bg-[#eef5e8]"
      >
        Login Dashboard
      </Link>
    );
  }

  return (
    <Link
      href="/pakar"
      className="hidden rounded-full border border-[#154212]/12 bg-white/65 px-4 py-2 text-sm font-semibold text-[#154212] shadow-sm transition-colors hover:bg-white md:inline-flex"
    >
      Login
    </Link>
  );
}
