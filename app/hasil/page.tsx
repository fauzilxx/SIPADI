"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import {
  diagnose,
  getCFLabel,
  getTreatment,
  type DiagnosisResult,
} from "../../lib/diagnosis";
import knowledgeBase from "../../knowledge_base_v2.json";

function HasilContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Parse selected symptom IDs from URL
  const selectedIds = useMemo(() => {
    const raw = searchParams.get("gejala");
    if (!raw) return [];
    return raw.split(",").filter(Boolean).map(part => {
      const [id, cfUserRaw] = part.split(":");
      return {
        id,
        cfUser: cfUserRaw ? parseFloat(cfUserRaw) : 1.0
      };
    });
  }, [searchParams]);

  // Run diagnosis
  const results: DiagnosisResult[] = useMemo(
    () => diagnose(selectedIds),
    [selectedIds]
  );

  const hasResults = results.length > 0;
  const topResult = hasResults ? results[0] : null;
  const treatment = topResult ? getTreatment(topResult.penyakitId) : null;

  // Placeholder data as requested
  const scientificName = topResult ? `${topResult.nama.split(" ")[0]} spec. (Lorem Ipsum)` : "";
  const description = topResult 
    ? `Berdasarkan gejala yang Anda masukkan, sistem kami mendeteksi adanya infeksi ${topResult.nama}. Segera lakukan tindakan penanganan untuk mencegah penyebaran ke seluruh petak sawah.` 
    : "";

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfdfa] font-sans">
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
                className="group relative py-2 px-1 mx-3 text-sm font-semibold transition-colors duration-300 text-text-muted hover:text-green-dark"
              >
                Pertanyaan
                <span className="absolute bottom-0 left-0 h-[2.5px] bg-green-dark transition-all duration-300 w-0" />
              </Link>
              <Link
                href="/hasil"
                className="group relative py-2 px-1 mx-3 text-sm font-semibold transition-colors duration-300 text-green-dark"
              >
                Diagnosis
                <span className="absolute bottom-0 left-0 h-[2.5px] bg-green-dark transition-all duration-300 w-full" />
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-green-pale transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileMenuOpen ? (
                  <><path d="M6 6l12 12" /><path d="M6 18L18 6" /></>
                ) : (
                  <><path d="M3 7h18" /><path d="M3 12h18" /><path d="M3 17h18" /></>
                )}
              </svg>
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 animate-fade-in">
              <div className="flex flex-col gap-1">
                <Link href="/" className="px-4 py-3 text-sm font-semibold rounded-lg text-text-muted hover:bg-green-pale">Home</Link>
                <Link href="/pertanyaan" className="px-4 py-3 text-sm font-semibold rounded-lg text-text-muted hover:bg-green-pale">Pertanyaan</Link>
                <Link href="/hasil" className="px-4 py-3 text-sm font-semibold rounded-lg text-green-dark bg-green-pale/80">Diagnosis</Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12">
          
          {/* Header section (Left aligned) */}
          <div className="mb-10 animate-fade-in-up">
            <div className="flex items-center gap-4 mb-3">
              <span className="text-[11px] font-bold text-[#7a9a28] tracking-widest uppercase">HASIL ANALISIS</span>
              <div className="h-[1px] w-16 bg-[#dce4d5]"></div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-[#154212] mb-8 tracking-tight">
              Hasil Diagnosa Akhir
            </h1>

            {/* Stepper */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 bg-[#f3f4f1] rounded-[12px] px-6 py-3.5">
                <div className="w-8 h-8 bg-[#b8c7b4] rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                <span className="text-sm font-bold text-[#8a9184]">Input Gejala</span>
              </div>
              <div className="flex items-center gap-3 bg-[#f8faf6] border border-[#dce4d5] rounded-[12px] px-6 py-3.5 shadow-sm">
                <div className="w-8 h-8 bg-[#154212] rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                <span className="text-sm font-bold text-[#154212]">Hasil Diagnosa</span>
              </div>
            </div>
          </div>

          {/* Results section */}
          {hasResults && topResult && treatment ? (
            <div className="space-y-8 animate-fade-in-up animation-delay-100">
              
              {/* Main Card (Top Result) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Left: Info */}
                <div className="bg-white rounded-[24px] p-8 lg:p-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col justify-center">
                  <div className="flex items-start gap-5 mb-8">
                    <div className="w-16 h-16 bg-[#BAD36F] rounded-[16px] flex items-center justify-center flex-shrink-0">
                       <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#154212" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                         <rect x="8" y="6" width="8" height="14" rx="4" />
                         <path d="M12 2v4" />
                         <path d="M19 10h-3" />
                         <path d="M19 14h-3" />
                         <path d="M19 18h-3" />
                         <path d="M5 10h3" />
                         <path d="M5 14h3" />
                         <path d="M5 18h3" />
                       </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl lg:text-[28px] font-bold text-[#154212] mb-1.5 leading-tight">{topResult.nama}</h2>
                      <p className="text-gray-500 italic text-sm">{scientificName}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="inline-flex items-center gap-2 bg-[#2d5028] text-white px-4 py-2 rounded-full">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <span className="text-sm font-semibold">Tingkat Kepercayaan {topResult.cfPercentage}%</span>
                    </div>
                  </div>

                  <p className="text-gray-600 leading-relaxed text-[15px]">
                    {description}
                  </p>
                </div>

                {/* Right: Image */}
                <div className="bg-white rounded-[24px] p-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#e0e8d8] border-dashed border-2">
                  <div className="w-full h-full min-h-[300px] bg-gray-100 rounded-[16px] overflow-hidden relative">
                    <img 
                      src="https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?q=80&w=800&auto=format&fit=crop" 
                      alt={topResult.nama} 
                      className="absolute inset-0 w-full h-full object-cover" 
                    />
                  </div>
                </div>
              </div>

              {/* Recommendations Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {/* Penanganan */}
                <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-[#f0f4ec] rounded-2xl flex items-center justify-center flex-shrink-0">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#154212" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
                    </div>
                    <h3 className="text-[17px] font-bold text-[#154212] leading-snug">Rekomendasi Penanganan<br/>Jangka Pendek</h3>
                  </div>
                  <ul className="space-y-4">
                    {treatment.penanganan.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg className="flex-shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7a9a28" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/></svg>
                        <span className="text-[#3a4435] leading-relaxed text-[14px] font-medium">
                          {/* Emphasizing the first few words as shown in design */}
                          <strong className="text-[#154212]">{item.split(':')[0] || item.split(' ')[0]} </strong> 
                          {item.includes(':') ? item.substring(item.indexOf(':') + 1) : item.substring(item.split(' ')[0].length)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pencegahan */}
                <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-[#f0f4ec] rounded-2xl flex items-center justify-center flex-shrink-0">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#154212" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <h3 className="text-[17px] font-bold text-[#154212] leading-snug">Strategi Pencegahan<br/>Jangka Panjang</h3>
                  </div>
                  <ul className="space-y-4">
                    {treatment.pencegahan.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg className="flex-shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7a9a28" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        <span className="text-[#3a4435] leading-relaxed text-[14px] font-medium">
                          <strong className="text-[#154212]">{item.split(':')[0] || item.split(' ')[0]} </strong> 
                          {item.includes(':') ? item.substring(item.indexOf(':') + 1) : item.substring(item.split(' ')[0].length)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 mb-8">
                <button 
                  onClick={() => window.print()}
                  className="w-full sm:w-auto bg-[#154212] text-white px-8 py-3.5 rounded-[12px] text-sm font-bold flex items-center justify-center gap-3 hover:bg-[#154212]/90 transition-colors shadow-md shadow-[#154212]/20"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Cetak Hasil Diagnosa
                </button>
                <Link 
                  href="/pertanyaan"
                  className="w-full sm:w-auto bg-white text-[#154212] border-2 border-[#154212] px-8 py-3.5 rounded-[12px] text-sm font-bold flex items-center justify-center gap-3 hover:bg-[#f0f4ec] transition-colors"
                >
                  Diagnosa Ulang
                </Link>
              </div>

              {/* Other possibilities if any */}
              {results.length > 1 && (
                <div className="mt-16 pt-8 border-t border-gray-200">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">Kemungkinan Penyakit Lainnya</h4>
                  <div className="flex flex-wrap justify-center gap-3">
                    {results.slice(1).map((res) => (
                      <div key={res.penyakitId} className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-3">
                        <span className="text-sm font-bold text-[#154212]">{res.nama}</span>
                        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{res.cfPercentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* No results state */
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Tidak Ditemukan Hasil</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
                Kombinasi gejala yang Anda masukkan tidak cukup kuat untuk menghasilkan diagnosis. Silakan kembali dan pilih gejala yang relevan.
              </p>
              <Link
                href="/pertanyaan"
                className="inline-flex items-center gap-2 bg-[#154212] text-white font-bold px-8 py-3.5 rounded-[12px] hover:bg-[#154212]/90 transition-all shadow-md"
              >
                Kembali Pilih Gejala
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#BAD36F] rounded-t-[60px] md:rounded-t-[80px] mt-auto w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 py-10 md:py-14">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#154212" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span className="text-green-dark font-bold text-lg">Sistem Pakar Diagnosa Padi</span>
              </div>
              <div className="text-xs sm:text-sm text-green-dark/80 font-medium leading-relaxed">
                <p>© 2026 SIPADI - Sistem Pakar Diagnosa Padi.</p>
                <p>Artificial Intelligence.</p>
              </div>
            </div>
            <div className="flex items-center gap-8 text-sm text-green-dark font-semibold">
              <a href="#" className="hover:text-green-dark/80 transition-colors">Tentang Kami</a>
              <a href="#" className="hover:text-green-dark/80 transition-colors">Bantuan</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function HasilPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#fcfdfa]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#BAD36F] border-t-[#154212] rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-[#154212]">Memproses diagnosa...</p>
          </div>
        </div>
      }
    >
      <HasilContent />
    </Suspense>
  );
}

