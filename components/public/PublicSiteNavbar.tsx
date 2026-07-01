"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import PublicLoginMenu from "@/components/PublicLoginMenu";

type PublicPageKey = "home" | "pertanyaan" | "diagnosis";

export default function PublicSiteNavbar({
  activePage,
  diagnosisHref = "/hasil",
}: {
  activePage: PublicPageKey;
  diagnosisHref?: string;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const homeLinkClass =
    activePage === "home"
      ? "text-green-dark"
      : "text-text-muted hover:text-green-dark";
  const pertanyaanLinkClass =
    activePage === "pertanyaan"
      ? "text-green-dark"
      : "text-text-muted hover:text-green-dark";
  const diagnosisLinkClass =
    activePage === "diagnosis"
      ? "text-green-dark"
      : "text-text-muted hover:text-green-dark";

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-[#BAD36F]/20 bg-[#BAD36F]/95 backdrop-blur-md">
      <div className="w-full px-4 sm:px-6 lg:px-12">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <div className="relative flex h-[18px] w-[18px] items-center justify-center transition-transform group-hover:scale-105">
              <Image
                src="/icons/Icon.svg"
                alt="SIPADI Logo"
                fill
                sizes="18px"
                className="object-contain"
              />
            </div>
            <span className="text-[25px] font-bold leading-none tracking-tight text-green-dark">
              SIPADI
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <Link
              href="/"
              className={`mx-3 px-1 py-2 text-sm font-semibold transition-colors duration-300 ${homeLinkClass}`}
            >
              Home
            </Link>
            <Link
              href="/pertanyaan"
              className={`mx-3 px-1 py-2 text-sm font-semibold transition-colors duration-300 ${pertanyaanLinkClass}`}
            >
              Pertanyaan
            </Link>
            <Link
              href={diagnosisHref}
              className={`mx-3 px-1 py-2 text-sm font-semibold transition-colors duration-300 ${diagnosisLinkClass}`}
            >
              Diagnosis
            </Link>
          </div>

          <PublicLoginMenu variant="desktop" />

          <button
            className="rounded-lg p-2 transition-colors hover:bg-green-pale md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {mobileMenuOpen ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M6 18L18 6" />
                </>
              ) : (
                <>
                  <path d="M3 7h18" />
                  <path d="M3 12h18" />
                  <path d="M3 17h18" />
                </>
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="animate-fade-in pb-4 md:hidden">
            <div className="flex flex-col gap-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                  activePage === "home"
                    ? "bg-green-pale/80 text-green-dark"
                    : "text-text-muted hover:bg-green-pale"
                }`}
              >
                Home
              </Link>
              <Link
                href="/pertanyaan"
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                  activePage === "pertanyaan"
                    ? "bg-green-pale/80 text-green-dark"
                    : "text-text-muted hover:bg-green-pale"
                }`}
              >
                Pertanyaan
              </Link>
              <Link
                href={diagnosisHref}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                  activePage === "diagnosis"
                    ? "bg-green-pale/80 text-green-dark"
                    : "text-text-muted hover:bg-green-pale"
                }`}
              >
                Diagnosis
              </Link>
              <PublicLoginMenu
                variant="mobile"
                onNavigate={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
