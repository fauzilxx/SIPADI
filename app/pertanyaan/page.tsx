"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import knowledgeBase from "../../knowledge_base_v2.json";

// Group labels for section headers
const kelompokLabels: Record<string, string> = {
  A: "Gejala pada Daun",
  B: "Gejala pada Batang & Pertumbuhan",
  C: "Gejala pada Malai & Bulir",
  D: "Kehadiran Hama & Pola Serangan",
  E: "Kondisi Lingkungan & Fase Tanaman",
};

export default function PertanyaanPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedGejala, setSelectedGejala] = useState<Map<string, number>>(new Map());

  const gejalaList = knowledgeBase.gejala;

  const toggleGejala = (id: string) => {
    setSelectedGejala((prev) => {
      const next = new Map(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.set(id, 1.0); // Default to 100%
      }
      return next;
    });
  };

  const updateCf = (id: string, cf: number) => {
    setSelectedGejala((prev) => {
      const next = new Map(prev);
      if (next.has(id)) {
        next.set(id, cf);
      }
      return next;
    });
  };

  const clearAll = () => {
    setSelectedGejala(new Map());
  };

  // Group gejala by kelompok while preserving order
  const groupedGejala: Record<string, typeof gejalaList> = {};
  for (const g of gejalaList) {
    if (!groupedGejala[g.kelompok]) {
      groupedGejala[g.kelompok] = [];
    }
    groupedGejala[g.kelompok].push(g);
  }

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
              <Link
                href="/"
                className="group relative py-2 px-1 mx-3 text-sm font-semibold transition-colors duration-300 text-text-muted hover:text-green-dark"
              >
                Home
                <span className="absolute bottom-0 left-0 h-[2.5px] bg-green-dark transition-all duration-300 w-0" />
              </Link>
              <Link
                href="/pertanyaan"
                className="group relative py-2 px-1 mx-3 text-sm font-semibold transition-colors duration-300 text-green-dark"
              >
                Pertanyaan
                <span className="absolute bottom-0 left-0 h-[2.5px] bg-green-dark transition-all duration-300 w-full" />
              </Link>
              <Link
                href="/pertanyaan"
                className="group relative py-2 px-1 mx-3 text-sm font-semibold transition-colors duration-300 text-text-muted hover:text-green-dark"
              >
                Diagnosis
                <span className="absolute bottom-0 left-0 h-[2.5px] bg-green-dark transition-all duration-300 w-0" />
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
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-semibold rounded-lg transition-colors text-text-muted hover:bg-green-pale"
                >
                  Home
                </Link>
                <Link
                  href="/pertanyaan"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-semibold rounded-lg transition-colors text-green-dark bg-green-pale/80"
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

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12">
          {/* Header Section */}
          <div className="text-center mb-10 md:mb-14 animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#BAD36F]/20 border border-[#BAD36F]/30 rounded-full px-4 py-1.5 mb-6">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#154212"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-xs font-bold text-green-dark tracking-wider uppercase">
                Proses Diagnosa
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold leading-tight tracking-tight text-green-dark mb-4">
              Pilih Indikasi Gejala yang Ditemukan
              <br className="hidden sm:block" />
              pada Tanaman Padi
            </h1>

            <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-2xl mx-auto">
              Mohon pilih indikasi gejala yang Anda temukan pada tanaman padi di
              lapangan untuk hasil diagnosa yang akurat.
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 md:mb-14 animate-fade-in-up animation-delay-100">
            {/* Step 1: Active */}
            <div className="flex items-center gap-4 bg-[#fffff6] border border-[#b8c7b4] rounded-[12px] px-6 py-4 w-full sm:w-[260px] shadow-sm">
              <div className="w-9 h-9 bg-green-dark rounded-full flex items-center justify-center text-white text-base font-bold shadow-sm flex-shrink-0">
                1
              </div>
              <span className="text-base font-bold text-green-dark">
                Input Gejala
              </span>
            </div>

            {/* Step 2: Inactive */}
            <div className="flex items-center gap-4 bg-[#fffff6] rounded-[12px] px-6 py-4 w-full sm:w-[260px]">
              <div className="w-9 h-9 bg-[#b9c0b5] rounded-full flex items-center justify-center text-white text-base font-bold shadow-sm flex-shrink-0">
                2
              </div>
              <span className="text-base font-bold text-[#8a9184]">
                Hasil Diagnosa
              </span>
            </div>
          </div>

          {/* ===== Main Gejala Container ===== */}
          <div className="bg-[#ffffff] rounded-[40px] border border-gray-100 shadow-sm p-6 sm:p-8 md:p-10 animate-fade-in-up animation-delay-200">
            {/* Gejala Sections */}
            <div className="space-y-8">
              {Object.entries(groupedGejala).map(
                ([kelompok, items], groupIndex) => (
                  <div key={kelompok}>
                    {/* Section indicator */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 bg-[#BAD36F] rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#154212"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                      <h2 className="text-base font-bold text-green-dark">
                        {kelompokLabels[kelompok] || `Kelompok ${kelompok}`}
                      </h2>
                    </div>

                    {/* Checkbox Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {items.map((gejala, index) => {
                        const isSelected = selectedGejala.has(gejala.id);
                        return (
                          <div
                            key={gejala.id}
                            id={`gejala-${gejala.id}`}
                            className={`group flex flex-col p-4 min-h-[84px] rounded-[16px] border transition-all duration-200 ${
                              isSelected
                                ? "bg-[#BAD36F]/15 border-[#BAD36F] shadow-md ring-1 ring-[#BAD36F]/30"
                                : "bg-white border-gray-200 hover:border-[#BAD36F]/50 hover:shadow-md hover:bg-[#fafff0]"
                            }`}
                            style={{
                              animationDelay: `${groupIndex * 80 + index * 30}ms`,
                            }}
                          >
                            <div
                              className="flex items-start gap-3.5 text-left cursor-pointer"
                              onClick={() => toggleGejala(gejala.id)}
                            >
                              {/* Custom Checkbox */}
                              <div
                                className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                                  isSelected
                                    ? "bg-green-dark border-green-dark scale-105"
                                    : "border-gray-300 group-hover:border-[#BAD36F]"
                                }`}
                              >
                                {isSelected && (
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </div>
  
                              {/* Label */}
                              <span
                                className={`text-sm leading-snug transition-colors duration-200 ${
                                  isSelected
                                    ? "text-green-dark font-semibold"
                                    : "text-text-dark font-medium"
                                }`}
                              >
                                {gejala.label}
                              </span>
                            </div>

                            {/* Slider Keyakinan */}
                            {isSelected && (
                              <div className="mt-4 pt-3 border-t border-[#BAD36F]/30 animate-fade-in-up w-full px-1">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-xs font-semibold text-green-dark">
                                    Tingkat Keyakinan:
                                  </span>
                                  <span className="text-xs font-bold bg-green-dark text-white px-2 py-0.5 rounded-full">
                                    {Math.round(selectedGejala.get(gejala.id)! * 100)}%
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min="10"
                                  max="100"
                                  step="1"
                                  value={Math.round(selectedGejala.get(gejala.id)! * 100)}
                                  onChange={(e) => updateCf(gejala.id, parseInt(e.target.value) / 100)}
                                  className="w-full h-2 bg-green-dark/20 rounded-lg appearance-none cursor-pointer accent-[#154212]"
                                />
                                <div className="flex justify-between mt-1 px-0.5">
                                  <span className="text-[10px] text-green-dark/70 font-medium">10%</span>
                                  <span className="text-[10px] text-green-dark/70 font-medium">100%</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Selected count + Action Buttons */}
            <div className="mt-10 md:mt-12 flex flex-col items-center gap-4">
              {/* Selected count badge */}
              {selectedGejala.size > 0 && (
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 bg-[#BAD36F]/20 border border-[#BAD36F]/30 rounded-full px-4 py-1.5">
                    <span className="text-xs font-bold text-green-dark">
                      {selectedGejala.size} gejala dipilih
                    </span>
                  </div>
                  <button
                    onClick={clearAll}
                    className="text-xs font-semibold text-text-muted hover:text-red-500 transition-colors underline underline-offset-2 cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              )}

              {/* CTA Button */}
              <button
                id="submit-diagnosa-button"
                disabled={selectedGejala.size === 0}
                onClick={() => {
                  const gejalaParam = Array.from(selectedGejala.entries())
                    .map(([id, cf]) => `${id}:${cf}`)
                    .join(",");
                  router.push(`/hasil?gejala=${gejalaParam}`);
                }}
                className={`inline-flex items-center gap-2.5 font-bold px-10 py-4 rounded-xl text-base transition-all duration-300 cursor-pointer ${
                  selectedGejala.size > 0
                    ? "bg-green-dark text-white hover:bg-green-dark/95 hover:shadow-xl hover:shadow-green-dark/20 hover:-translate-y-0.5"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Lihat Hasil Diagnosa
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
              </button>
            </div>
          </div>
        </div>
      </main>

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
