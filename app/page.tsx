"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#BAD36F]/95 backdrop-blur-md border-b border-[#BAD36F]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-[120px]">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-green-dark rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                    fill="none"
                  />
                  <path
                    d="M7 17c0-3 2-8 5-13 3 5 5 10 5 13"
                    stroke="#C5E1A5"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M12 4v16"
                    stroke="#C5E1A5"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9 10c1 0.5 2 1 3 1s2-0.5 3-1"
                    stroke="#C5E1A5"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </div>
              <span className="text-lg font-bold text-green-dark tracking-tight">
                SIPADI
              </span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <a
                href="#hero"
                className="px-4 py-2 text-sm font-medium text-text-dark hover:text-green-dark hover:bg-green-pale rounded-lg transition-all duration-200"
              >
                Home
              </a>
              <a
                href="#features"
                className="px-4 py-2 text-sm font-medium text-text-muted hover:text-green-dark hover:bg-green-pale rounded-lg transition-all duration-200"
              >
                Pertanyaan
              </a>
              <a
                href="#cta"
                className="px-4 py-2 text-sm font-medium text-text-muted hover:text-green-dark hover:bg-green-pale rounded-lg transition-all duration-200"
              >
                Diagnosis
              </a>
            </div>

            {/* Mobile Hamburger */}
            <button
              id="mobile-menu-button"
              className="md:hidden p-2 rounded-lg hover:bg-green-pale transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 animate-fade-in">
              <div className="flex flex-col gap-1">
                <a
                  href="#hero"
                  className="px-4 py-3 text-sm font-medium text-text-dark hover:bg-green-pale rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </a>
                <a
                  href="#features"
                  className="px-4 py-3 text-sm font-medium text-text-muted hover:bg-green-pale rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pertanyaan
                </a>
                <a
                  href="#cta"
                  className="px-4 py-3 text-sm font-medium text-text-muted hover:bg-green-pale rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Diagnosis
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ===== SECTION 1: HERO ===== */}
      <section
        id="hero"
        className="relative pt-28 pb-16 md:pt-36 md:pb-24 px-4 sm:px-6 lg:px-[120px] overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute top-20 right-0 w-72 h-72 bg-green-pale rounded-full blur-3xl opacity-40 -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cream rounded-full blur-3xl opacity-30 -z-10" />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Text Content */}
            <div className="flex flex-col gap-6 animate-fade-in-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-green-pale/60 border border-green-light/50 rounded-full px-4 py-1.5 w-fit">
                <span className="text-sm">⚡</span>
                <span className="text-xs font-semibold text-green-dark tracking-wider uppercase">
                  AI Powered Diagnosis
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.12] tracking-tight text-text-dark">
                Solusi Pakar untuk{" "}
                <span className="text-green-dark">Kesehatan Padi</span> Anda.
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-lg">
                SIPADI menggunakan kecerdasan buatan untuk mendiagnosa penyakit
                dan hama pada tanaman padi Anda secara cepat, akurat, dan
                dilengkapi panduan penanganan dari para ahli.
              </p>

              {/* CTA Button */}
              <div className="flex items-center gap-4 mt-2">
                <a
                  href="#cta"
                  id="hero-cta-button"
                  className="inline-flex items-center gap-2 bg-green-dark text-white font-semibold px-7 py-3.5 rounded-full hover:bg-green-medium transition-all duration-300 hover:shadow-lg hover:shadow-green-dark/20 hover:-translate-y-0.5"
                >
                  Mulai Diagnosa
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* Right — Image + Floating Card */}
            <div className="relative animate-fade-in-up animation-delay-200">
              <div className="relative rounded-[var(--radius-2xl)] overflow-hidden shadow-2xl shadow-green-dark/10">
                <Image
                  src="/images/padi.png"
                  alt="Tanaman padi sehat di sawah"
                  width={640}
                  height={480}
                  className="w-full h-auto object-cover"
                  preload
                />
              </div>

              {/* Floating Accuracy Card */}
              <div className="absolute -bottom-5 -left-4 sm:-left-6 bg-white rounded-[var(--radius-xl)] shadow-xl p-4 flex items-center gap-3 animate-float border border-green-pale/60">
                <div className="w-10 h-10 bg-green-dark rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="#C5E1A5"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-text-muted font-medium">
                    Akurasi Diagnosa
                  </p>
                  <p className="text-xl font-bold text-green-dark">98.4%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 2: FEATURES ===== */}
      <section
        id="features"
        className="py-20 md:py-28 px-4 sm:px-6 lg:px-[120px] bg-white"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-14 md:mb-20 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-text-dark tracking-tight mb-4">
              Mengapa Menggunakan{" "}
              <span className="text-green-dark">SIPADI</span>?
            </h2>
            <p className="text-base sm:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
              Platform diagnosa cerdas yang dirancang khusus untuk membantu
              petani Indonesia menjaga kesehatan tanaman padi mereka.
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1 — AI Reasoning (spans 2 cols on lg) */}
            <div className="lg:col-span-2 bg-green-dark rounded-[var(--radius-xl)] p-7 md:p-9 text-white relative overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-green-dark/30 animate-fade-in-up animation-delay-100">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-green-medium rounded-full -translate-y-1/2 translate-x-1/3 opacity-30" />
              <div className="absolute bottom-0 left-1/2 w-24 h-24 bg-green-light rounded-full translate-y-1/2 opacity-10" />

              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/15 rounded-[var(--radius-md)] flex items-center justify-center mb-5 backdrop-blur-sm">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 15a3 3 0 100-6 3 3 0 000 6z"
                      stroke="#C5E1A5"
                      strokeWidth="2"
                    />
                    <path
                      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"
                      stroke="#C5E1A5"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3">
                  Penalaran Pakar (AI Reasoning)
                </h3>
                <p className="text-sm md:text-base text-green-light/90 leading-relaxed mb-6 max-w-md">
                  Sistem kami menggunakan mesin inferensi berbasis aturan pakar
                  pertanian untuk menganalisis gejala dan memberikan diagnosa
                  yang tepat, layaknya konsultasi dengan ahli.
                </p>
                <a
                  href="#cta"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-green-light hover:text-white transition-colors group/link"
                >
                  Mulai Diagnosa
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="transition-transform group-hover/link:translate-x-1"
                  >
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* Card 2 — Hasil Instan */}
            <div className="bg-cream-light border border-green-light/30 rounded-[var(--radius-xl)] p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:border-green-light/50 hover:-translate-y-1 animate-fade-in-up animation-delay-200">
              <div>
                <div className="w-12 h-12 bg-green-pale rounded-[var(--radius-md)] flex items-center justify-center mb-5">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M9 12l2 2 4-4"
                      stroke="#1B5E20"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="#1B5E20"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-text-dark mb-2">
                  Hasil Instan
                </h3>
                <p className="text-sm text-text-muted leading-relaxed mb-6">
                  Dapatkan hasil diagnosa dalam hitungan detik. Tidak perlu
                  menunggu lama untuk mengetahui kondisi tanaman Anda.
                </p>
              </div>

              {/* User avatars */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-green-dark flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">
                    A
                  </div>
                  <div className="w-8 h-8 rounded-full bg-green-medium flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">
                    B
                  </div>
                  <div className="w-8 h-8 rounded-full bg-green-olive flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">
                    C
                  </div>
                  <div className="w-8 h-8 rounded-full bg-green-light flex items-center justify-center text-green-dark text-xs font-bold ring-2 ring-white">
                    +5k
                  </div>
                </div>
                <p className="text-xs text-text-muted leading-snug">
                  Dipercaya oleh
                  <br />
                  <span className="font-semibold text-text-dark">
                    ribuan petani lokal
                  </span>
                </p>
              </div>
            </div>

            {/* Card 3 — Panduan Penanganan */}
            <div className="bg-cream-light border border-green-light/30 rounded-[var(--radius-xl)] p-7 transition-all duration-300 hover:shadow-xl hover:border-green-light/50 hover:-translate-y-1 animate-fade-in-up animation-delay-300">
              <div className="w-12 h-12 bg-green-pale rounded-[var(--radius-md)] flex items-center justify-center mb-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
                    stroke="#1B5E20"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <rect
                    x="9"
                    y="3"
                    width="6"
                    height="4"
                    rx="1"
                    stroke="#1B5E20"
                    strokeWidth="2"
                  />
                  <path
                    d="M9 12h6M9 16h4"
                    stroke="#1B5E20"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-text-dark mb-2">
                Panduan Penanganan
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Setiap hasil diagnosa dilengkapi dengan panduan penanganan
                lengkap mulai dari pencegahan, pengendalian, hingga rekomendasi
                pestisida yang tepat.
              </p>
            </div>

            {/* Card 4 — CTA Card with Image */}
            <div className="lg:col-span-2 bg-green-pale/40 border border-green-light/40 rounded-[var(--radius-xl)] p-7 md:p-9 flex flex-col sm:flex-row items-center gap-6 transition-all duration-300 hover:shadow-xl hover:bg-green-pale/60 animate-fade-in-up animation-delay-400">
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-bold text-text-dark mb-3">
                  Yuk, Kenali Kondisi Padi Anda!
                </h3>
                <p className="text-sm text-text-muted leading-relaxed mb-5">
                  Cukup jawab beberapa pertanyaan sederhana tentang gejala yang
                  Anda temukan, dan sistem kami akan memberikan diagnosa beserta
                  solusinya.
                </p>
                <a
                  href="#cta"
                  className="inline-flex items-center gap-2 bg-green-dark text-white font-semibold px-6 py-3 rounded-full hover:bg-green-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 text-sm"
                >
                  Mulai Sekarang
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
              <div className="w-full sm:w-48 md:w-56 flex-shrink-0 rounded-[var(--radius-lg)] overflow-hidden shadow-lg">
                <Image
                  src="/images/farmer.png"
                  alt="Petani memegang tanaman padi"
                  width={240}
                  height={300}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: CTA BANNER + FOOTER ===== */}
      <section id="cta" className="py-16 md:py-24 px-4 sm:px-6 lg:px-[120px]">
        <div className="max-w-7xl mx-auto">
          {/* CTA Banner */}
          <div className="relative bg-green-dark rounded-[var(--radius-2xl)] px-8 py-14 md:px-16 md:py-20 text-center overflow-hidden animate-fade-in-up">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-48 h-48 bg-green-medium rounded-full -translate-x-1/3 -translate-y-1/3 opacity-30" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-green-medium rounded-full translate-x-1/4 translate-y-1/4 opacity-20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-light rounded-full opacity-5" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                Siap Mengamankan Hasil Panen Anda?
              </h2>
              <p className="text-base md:text-lg text-green-light/80 leading-relaxed mb-8 max-w-lg mx-auto">
                Jangan biarkan penyakit dan hama merusak padi Anda. Gunakan
                SIPADI sekarang untuk diagnosa dini dan penanganan tepat.
              </p>
              <a
                href="#"
                id="cta-main-button"
                className="inline-flex items-center gap-2 bg-green-light text-green-dark font-bold px-8 py-4 rounded-full hover:bg-cream hover:text-green-dark transition-all duration-300 hover:shadow-xl hover:shadow-green-light/30 hover:-translate-y-0.5 text-base"
              >
                Mulai Diagnosa Gratis
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-green-olive/15 border-t border-green-light/30 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-[120px] py-10 md:py-14">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            {/* Footer Logo */}
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-dark rounded-lg flex items-center justify-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M7 17c0-3 2-8 5-13 3 5 5 10 5 13"
                      stroke="#C5E1A5"
                      strokeWidth="2"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M12 4v16"
                      stroke="#C5E1A5"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className="text-base font-bold text-green-dark">
                  SIPADI
                </span>
              </div>
              <p className="text-sm text-text-muted">
                Sistem Pakar Diagnosa Padi
              </p>
            </div>

            {/* Footer Links */}
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm text-text-muted hover:text-green-dark transition-colors font-medium"
              >
                Tentang Kami
              </a>
              <a
                href="#"
                className="text-sm text-text-muted hover:text-green-dark transition-colors font-medium"
              >
                Bantuan
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-green-light/30 mt-8 pt-6 text-center">
            <p className="text-xs text-text-muted">
              © 2026 SIPADI - Sistem Pakar Diagnosa Padi. Artificial
              Intelligence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
