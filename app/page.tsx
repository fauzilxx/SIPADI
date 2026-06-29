"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#BAD36F]/95 backdrop-blur-md border-b border-[#BAD36F]/20">
        <div className="w-full px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-[18px] h-[18px] flex items-center justify-center transition-transform group-hover:scale-105">
                <img
                  src="/icons/Icon.svg"
                  alt="SIPADI Logo"
                  className="h-[18px] w-auto object-contain"
                />
              </div>
              <span className="text-[25px] font-bold text-green-dark tracking-tight leading-none">
                SIPADI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <a
                href="#hero"
                onClick={() => setActiveSection("hero")}
                className={`group relative py-2 px-1 mx-3 text-sm font-semibold transition-colors duration-300 ${activeSection === "hero"
                    ? "text-green-dark"
                    : "text-text-muted hover:text-green-dark"
                  }`}
              >
                Home
                <span
                  className={`absolute bottom-0 left-0 h-[2.5px] bg-green-dark transition-all duration-300 ${activeSection === "hero" ? "w-full" : "w-0"
                    }`}
                />
              </a>
              <Link
                href="/pertanyaan"
                className="group relative py-2 px-1 mx-3 text-sm font-semibold transition-colors duration-300 text-text-muted hover:text-green-dark"
              >
                Pertanyaan
                <span className="absolute bottom-0 left-0 h-[2.5px] bg-green-dark transition-all duration-300 w-0 group-hover:w-full" />
              </Link>
              <Link
                href="/pertanyaan"
                className="group relative py-2 px-1 mx-3 text-sm font-semibold transition-colors duration-300 text-text-muted hover:text-green-dark"
              >
                Diagnosis
                <span className="absolute bottom-0 left-0 h-[2.5px] bg-green-dark transition-all duration-300 w-0 group-hover:w-full" />
              </Link>
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
                  onClick={() => {
                    setActiveSection("hero");
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-3 text-sm font-semibold rounded-lg transition-colors text-green-dark bg-green-pale/80"
                >
                  Home
                </a>
                <Link
                  href="/pertanyaan"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-semibold rounded-lg transition-colors text-text-muted hover:bg-green-pale"
                >
                  Pertanyaan
                </Link>
                <Link
                  href="/pertanyaan"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-semibold rounded-lg transition-colors text-text-muted hover:bg-green-pale"
                >
                  Diagnosis
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ===== SECTION 1: HERO ===== */}
      <section
        id="hero"
        className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden"
      >
        {/* Removed decorative background elements */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Text Content */}
            <div className="flex flex-col gap-6 animate-fade-in-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-[#BAD36F]/20 border border-[#BAD36F]/30 rounded-full px-4 py-1.5 w-fit">
                <img
                  src="/icons/thunder_icon.svg"
                  alt="Thunder"
                  className="w-[10px] h-[12px] object-contain"
                />
                <span className="text-xs font-bold text-green-dark tracking-wider uppercase">
                  AI Powered Diagnosis
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.12] tracking-tight text-green-dark">
                Solusi Pakar untuk <br className="hidden lg:block" />
                <span className="text-green-accent">Kesehatan Padi</span> Anda.
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-xl">
                Melalui <strong className="font-bold text-text-dark">SIPADI (Sistem Pakar Diagnosa Padi)</strong>, Anda dapat mengidentifikasi hama dan penyakit tanaman secara akurat dalam hitungan detik. Kami menggunakan algoritma penalaran pakar untuk membantu petani mengamankan hasil panen yang melimpah.
              </p>

              {/* CTA Button */}
              <div className="flex items-center gap-4 mt-2">
                <Link
                  href="/pertanyaan"
                  id="hero-cta-button"
                  className="inline-flex items-center gap-2 bg-green-dark text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-green-dark/95 transition-all duration-300 hover:shadow-lg hover:shadow-green-dark/20 hover:-translate-y-0.5"
                >
                  Mulai Diagnosa
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right — Image + Floating Card */}
            <div className="relative animate-fade-in-up animation-delay-200">
              {/* Image with white frame */}
              <div className="relative bg-white p-3 rounded-[32px] shadow-xl border border-gray-100 overflow-hidden">
                <Image
                  src="/images/padi.png"
                  alt="Tanaman padi sehat di sawah"
                  width={640}
                  height={480}
                  className="w-full h-auto object-cover rounded-[20px]"
                  preload
                />
              </div>

              {/* Floating Accuracy Card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-[var(--radius-xl)] shadow-2xl p-4 sm:p-5 flex items-center gap-3.5 border border-gray-100 animate-float">
                <div className="w-12 h-12 bg-[#c2f363] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#154212"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
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
        className="py-20 md:py-28"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          {/* Section Header */}
          <div className="text-center mb-14 md:mb-20 animate-fade-in-up">
            <h2
              className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight mb-4"
              style={{ color: "#154212", lineHeight: "40px" }}
            >
              Mengapa Menggunakan SIPADI?
            </h2>
            <p className="text-base sm:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
              Platform diagnosa cerdas yang dirancang khusus untuk membantu
              petani Indonesia menjaga kesehatan tanaman padi mereka.
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1 — AI Reasoning (spans 2 cols on lg) */}
            <div className="lg:col-span-2 bg-white border border-gray-100 shadow-sm rounded-[var(--radius-xl)] p-7 md:p-9 relative overflow-hidden group transition-all duration-300 hover:shadow-xl animate-fade-in-up animation-delay-100">
              {/* Watermark head profile SVG */}
              <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none opacity-[0.06] select-none text-text-dark hidden sm:block">
                <svg
                  width="140"
                  height="140"
                  viewBox="0 0 56 56"
                  fill="currentColor"
                >
                  <path d="M19.8677 40.5V35.125C18.6802 34.0417 17.7583 32.776 17.1021 31.3281C16.4458 29.8802 16.1177 28.3542 16.1177 26.75C16.1177 23.625 17.2114 20.9688 19.3989 18.7812C21.5864 16.5938 24.2427 15.5 27.3677 15.5C29.9718 15.5 32.2791 16.2656 34.2896 17.7969C36.3 19.3281 37.6073 21.3229 38.2114 23.7812L39.8364 30.1875C39.9406 30.5833 39.8677 30.9427 39.6177 31.2656C39.3677 31.5885 39.0343 31.75 38.6177 31.75H36.1177V35.5C36.1177 36.1875 35.8729 36.776 35.3833 37.2656C34.8937 37.7552 34.3052 38 33.6177 38H31.1177V40.5H28.6177V35.5H33.6177V29.25H36.9927L35.8052 24.4062C35.326 22.5104 34.3052 20.9688 32.7427 19.7812C31.1802 18.5938 29.3885 18 27.3677 18C24.951 18 22.8885 18.8438 21.1802 20.5312C19.4718 22.2188 18.6177 24.2708 18.6177 26.6875C18.6177 27.9375 18.8729 29.125 19.3833 30.25C19.8937 31.375 20.6177 32.375 21.5552 33.25L22.3677 34V40.5H19.8677ZM26.1177 31.75H28.6177L28.8052 30.1875C28.9718 30.125 29.1229 30.0521 29.2583 29.9688C29.3937 29.8854 29.5135 29.7917 29.6177 29.6875L31.0552 30.3125L32.3052 28.1875L31.0552 27.25C31.0968 27.0833 31.1177 26.9167 31.1177 26.75C31.1177 26.5833 31.0968 26.4167 31.0552 26.25L32.3052 25.3125L31.0552 23.1875L29.6177 23.8125C29.5135 23.7083 29.3937 23.6146 29.2583 23.5312C29.1229 23.4479 28.9718 23.375 28.8052 23.3125L28.6177 21.75H26.1177L25.9302 23.3125C25.7635 23.375 25.6125 23.4479 25.4771 23.5312C25.3416 23.6146 25.2218 23.7083 25.1177 23.8125L23.6802 23.1875L22.4302 25.3125L23.6802 26.25C23.6385 26.4167 23.6177 26.5833 23.6177 26.75C23.6177 26.9167 23.6385 27.0833 23.6802 27.25L22.4302 28.1875L23.6802 30.3125L25.1177 29.6875C25.2218 29.7917 25.3416 29.8854 25.4771 29.9688C25.6125 30.0521 25.7635 30.125 25.9302 30.1875L26.1177 31.75ZM27.3677 28.625C26.8468 28.625 26.4041 28.4427 26.0396 28.0781C25.675 27.7135 25.4927 27.2708 25.4927 26.75C25.4927 26.2292 25.675 25.7865 26.0396 25.4219C26.4041 25.0573 26.8468 24.875 27.3677 24.875C27.8885 24.875 28.3312 25.0573 28.6958 25.4219C29.0604 25.7865 29.2427 26.2292 29.2427 26.75C29.2427 27.2708 29.0604 27.7135 28.6958 28.0781C28.3312 28.4427 27.8885 28.625 27.3677 28.625Z" />
                </svg>
              </div>

              <div className="relative z-10">
                <div className="mb-5">
                  <img
                    src="/icons/container1_1.svg"
                    alt="AI Reasoning"
                    className="w-14 h-14 object-contain"
                  />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3" style={{ color: "#154212" }}>
                  Penalaran Pakar (AI Reasoning)
                </h3>
                <p className="text-sm md:text-base text-text-muted leading-relaxed mb-6 max-w-md">
                  Sistem ini bekerja seperti seorang dokter tanaman. Anda hanya perlu menjawab
                  beberapa pertanyaan singkat, dan sistem akan langsung mendeteksi masalah
                  pada padi Anda dengan hasil yang akurat.
                </p>
                <Link
                  href="/pertanyaan"
                  className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-85 group/link"
                  style={{ color: "#154212" }}
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
                </Link>
              </div>
            </div>

            {/* Card 2 — Hasil Instan */}
            <div className="bg-[#c2f363]/20 border border-[#c2f363]/10 rounded-[var(--radius-xl)] p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in-up animation-delay-200">
              <div>
                <div className="mb-5">
                  <img
                    src="/icons/container2.svg"
                    alt="Hasil Instan"
                    className="w-14 h-14 object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "#154212" }}>
                  Hasil Instan
                </h3>
                <p className="text-sm text-text-muted leading-relaxed mb-6">
                  Dapatkan diagnosis dan saran penanganan hanya dalam kurun waktu kurang dari 2 menit.
                </p>
              </div>

              {/* User avatars */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm ring-2 ring-white shadow-sm select-none">
                    👨‍🌾
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm ring-2 ring-white shadow-sm select-none">
                    👩‍🌾
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm ring-2 ring-white shadow-sm select-none">
                    🚜
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#c2f363] flex items-center justify-center text-[#154212] text-xs font-bold ring-2 ring-white shadow-sm select-none">
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
            <div className="bg-[#e4e3d8] rounded-[var(--radius-xl)] p-7 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in-up animation-delay-300">
              <div className="mb-5">
                <img
                  src="/icons/container3.svg"
                  alt="Panduan Penanganan"
                  className="w-14 h-14 object-contain"
                />
              </div>
              <h3 className="text-lg font-bold text-text-dark mb-2">
                Panduan Penanganan
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Bukan sekadar diagnosis. Kami memberikan langkah-langkah praktis penanganan kimiawi dan organik yang aman bagi lingkungan.
              </p>
            </div>

            {/* Card 4 — CTA Card with Image */}
            <div className="lg:col-span-2 bg-[#154212]/5 border border-[#154212]/10 rounded-[var(--radius-xl)] p-7 md:p-9 flex flex-col sm:flex-row items-center gap-6 transition-all duration-300 hover:shadow-xl animate-fade-in-up animation-delay-400">
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-bold mb-3" style={{ color: "#154212" }}>
                  Yuk, Kenali Kondisi Padi Anda!
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  Cari tahu masalah pada tanaman padi Anda hanya dengan beberapa klik. Mulai diagnosis sekarang untuk mendapatkan penanganan yang cepat dan tepat demi hasil panen yang melimpah
                </p>
              </div>
              <div className="w-full sm:w-60 md:w-68 flex-shrink-0 rounded-[var(--radius-lg)] overflow-hidden shadow-md">
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
      <section id="cta" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
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
              <Link
                href="/pertanyaan"
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
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#BAD36F] rounded-t-[60px] md:rounded-t-[80px] mt-auto w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 py-10 md:py-14">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            {/* Left Column: Title & Copyright */}
            <div className="flex flex-col gap-3">
              <div className="text-green-dark font-bold text-lg">
                Sistem Pakar Diagnosa Padi
              </div>
              <div className="text-xs sm:text-sm text-green-dark/80 font-medium leading-relaxed">
                <p>© 2026 SIPADI - Sistem Pakar Diagnosa Padi .</p>
                <p>Artificial Intelligence.</p>
              </div>
            </div>

            {/* Right Column: Links */}
            <div className="flex items-center gap-8 text-sm text-green-dark font-semibold">
              <a
                href="#"
                className="hover:text-green-dark/80 transition-colors"
              >
                Tentang Kami
              </a>
              <Link
                href="/pakar"
                className="hover:text-green-dark/80 transition-colors"
              >
                Dashboard Pakar
              </Link>
              <a
                href="#"
                className="hover:text-green-dark/80 transition-colors"
              >
                Bantuan
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
