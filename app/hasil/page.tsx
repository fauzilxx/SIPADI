"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { DiagnosisResult } from "@/lib/diagnosis";
import {
  getPenyakitImageAsset,
  type SelectedGejalaInput,
  type Treatment,
} from "@/lib/knowledge-base";

const STORAGE_KEY = "sipadi:selected-gejala";

interface DiagnosisApiResponse {
  success: boolean;
  message?: string;
  errors?: string[];
  selectedGejala?: SelectedGejalaInput[];
  selectedKelompok?: { id: string; label: string }[];
  totalSelectedGejala?: number;
  results?: DiagnosisResult[];
  topResult?: DiagnosisResult | null;
  topResultLabel?: string | null;
  treatment?: Treatment | null;
  supplementalRecommendation?: SupplementalRecommendation | null;
}

interface MarketplaceProduct {
  id: string;
  productName: string;
  activeIngredient: string;
  category: string;
  imageFileName: string;
  catatanPenggunaan: string;
  marketplaceLinks: {
    shopee?: string;
    tokopedia?: string;
    blibli?: string;
  };
}

interface NonChemicalControlItem {
  id: string;
  nama: string;
  slug: string;
  jenis: string;
  punyaFotoProduk: boolean;
  imageFileName?: string;
  deskripsi: string;
  catatanPenggunaan: string;
  marketplaceSearchLinks?: {
    shopee?: string;
    tokopedia?: string;
    blibli?: string;
  };
}

interface SupplementalRecommendation {
  penyakit_id: string;
  nama: string;
  productIds: {
    marketplace: string[];
    nonKimia: string[];
  };
  solusi: {
    kimia: string[];
    mekanis: string[];
    biologis: string[];
  };
  pencegahan_jangka_pendek: string[];
  pencegahan_jangka_panjang: string[];
  marketplaceProducts: MarketplaceProduct[];
  nonChemicalControls: NonChemicalControlItem[];
  unresolvedMarketplaceProductIds: string[];
  unresolvedNonChemicalControlIds: string[];
  missingMarketplaceProductImageIds: string[];
  missingNonChemicalImageIds: string[];
}

export default function HasilPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [data, setData] = useState<DiagnosisApiResponse | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);

    if (!raw) {
      setErrorMessage(
        "Data gejala belum tersedia. Silakan kembali ke halaman pertanyaan."
      );
      setLoading(false);
      return;
    }

    let selectedGejala: SelectedGejalaInput[] = [];

    try {
      selectedGejala = JSON.parse(raw) as SelectedGejalaInput[];
    } catch {
      setErrorMessage(
        "Data gejala tidak dapat dibaca. Silakan ulangi proses diagnosis."
      );
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function runDiagnosis() {
      try {
        const response = await fetch("/api/diagnosis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ selectedGejala }),
          signal: controller.signal,
        });

        const payload = (await response.json()) as DiagnosisApiResponse;

        if (!response.ok || !payload.success) {
          setErrorMessage(
            payload.errors?.join(" ") ??
              payload.message ??
              "Diagnosis gagal diproses."
          );
          setLoading(false);
          return;
        }

        setData(payload);
        setLoading(false);
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        setErrorMessage("Tidak dapat terhubung ke backend diagnosis.");
        setLoading(false);
      }
    }

    runDiagnosis();

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcfdfa]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#BAD36F] border-t-[#154212]" />
          <p className="text-sm font-semibold text-[#154212]">
            Memproses diagnosa dari backend...
          </p>
        </div>
      </div>
    );
  }

  const results = data?.results ?? [];
  const topResult = data?.topResult ?? null;
  const treatment = data?.treatment ?? null;
  const supplementalRecommendation = data?.supplementalRecommendation ?? null;
  const hasResults = Boolean(topResult && treatment);
  const hasSupplementalWarnings = Boolean(
    supplementalRecommendation &&
      (supplementalRecommendation.unresolvedMarketplaceProductIds.length > 0 ||
        supplementalRecommendation.unresolvedNonChemicalControlIds.length > 0 ||
        supplementalRecommendation.missingMarketplaceProductImageIds.length > 0 ||
        supplementalRecommendation.missingNonChemicalImageIds.length > 0)
  );
  const penyakitImage = topResult
    ? getPenyakitImageAsset(topResult.penyakitId)
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-[#fcfdfa] font-sans">
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-[#BAD36F]/20 bg-[#BAD36F]/95 backdrop-blur-md">
        <div className="w-full px-4 sm:px-6 lg:px-12">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="group flex items-center gap-2">
              <div className="relative flex h-[18px] w-[18px] items-center justify-center transition-transform group-hover:scale-105">
                <img
                  src="/icons/Icon.svg"
                  alt="SIPADI Logo"
                  className="h-[18px] w-auto object-contain"
                />
              </div>
              <span className="text-[25px] font-bold leading-none tracking-tight text-green-dark">
                SIPADI
              </span>
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              <Link
                href="/"
                className="mx-3 px-1 py-2 text-sm font-semibold text-text-muted transition-colors duration-300 hover:text-green-dark"
              >
                Home
              </Link>
              <Link
                href="/pertanyaan"
                className="mx-3 px-1 py-2 text-sm font-semibold text-text-muted transition-colors duration-300 hover:text-green-dark"
              >
                Pertanyaan
              </Link>
              <Link
                href="/hasil"
                className="mx-3 px-1 py-2 text-sm font-semibold text-green-dark transition-colors duration-300"
              >
                Diagnosis
              </Link>
            </div>

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
                  className="rounded-lg px-4 py-3 text-sm font-semibold text-text-muted transition-colors hover:bg-green-pale"
                >
                  Home
                </Link>
                <Link
                  href="/pertanyaan"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-semibold text-text-muted transition-colors hover:bg-green-pale"
                >
                  Pertanyaan
                </Link>
                <Link
                  href="/hasil"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg bg-green-pale/80 px-4 py-3 text-sm font-semibold text-green-dark transition-colors"
                >
                  Diagnosis
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1 pb-16 pt-28 md:pb-24 md:pt-36">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-12">
          <div className="mb-10">
            <div className="mb-3 flex items-center gap-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#7a9a28]">
                HASIL ANALISIS
              </span>
              <div className="h-[1px] w-16 bg-[#dce4d5]" />
            </div>
            <h1 className="mb-8 text-4xl font-extrabold tracking-tight text-[#154212] lg:text-5xl">
              Hasil Diagnosa Akhir
            </h1>
          </div>

          {errorMessage ? (
            <div className="rounded-[24px] border border-red-100 bg-white p-12 text-center shadow-sm">
              <h3 className="mb-3 text-xl font-bold text-gray-800">
                Diagnosis Belum Bisa Ditampilkan
              </h3>
              <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-gray-500">
                {errorMessage}
              </p>
              <Link
                href="/pertanyaan"
                className="inline-flex items-center gap-2 rounded-[12px] bg-[#154212] px-8 py-3.5 font-bold text-white transition-all hover:bg-[#154212]/90"
              >
                Kembali Pilih Gejala
              </Link>
            </div>
          ) : hasResults && topResult && treatment ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                <div className="flex flex-col justify-center rounded-[24px] border border-gray-100 bg-white p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] lg:p-10">
                  <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start">
                    <div className="relative h-36 w-full overflow-hidden rounded-[24px] bg-[#eef5e8] sm:h-40 sm:w-40 sm:flex-shrink-0">
                      {penyakitImage ? (
                        <Image
                          src={penyakitImage.src}
                          alt={penyakitImage.alt}
                          fill
                          sizes="(max-width: 640px) 100vw, 160px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-[24px] bg-[#BAD36F]">
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#154212"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
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
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="mb-1.5 text-2xl font-bold leading-tight text-[#154212] lg:text-[28px]">
                        {topResult.nama}
                      </h2>
                      <p className="text-sm italic text-gray-500">
                        {topResult.jenis === "hama"
                          ? "Kategori Hama"
                          : "Kategori Penyakit"}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6 flex flex-wrap gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#2d5028] px-4 py-2 text-white">
                      <span className="text-sm font-semibold">
                        Tingkat Kepercayaan {topResult.cfPercentage}%
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#eef5e8] px-4 py-2 text-[#154212]">
                      <span className="text-sm font-semibold">
                        {data?.topResultLabel}
                      </span>
                    </div>
                  </div>

                  <p className="mb-6 text-[15px] leading-relaxed text-gray-600">
                    Sistem backend SIPADI menyimpulkan bahwa kombinasi gejala
                    yang Anda pilih paling kuat mengarah ke{" "}
                    <strong className="text-[#154212]">{topResult.nama}</strong>.
                    Hasil ini dihitung dengan metode Forward Chaining dan
                    Certainty Factor dari backend diagnosis.
                  </p>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-[18px] bg-[#f8faf6] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Gejala Dipilih
                      </p>
                      <p className="mt-1 text-lg font-bold text-[#154212]">
                        {data?.totalSelectedGejala}
                      </p>
                    </div>
                    <div className="rounded-[18px] bg-[#f8faf6] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Gejala Mendukung
                      </p>
                      <p className="mt-1 text-lg font-bold text-[#154212]">
                        {topResult.positiveMatchCount}
                      </p>
                    </div>
                    <div className="rounded-[18px] bg-[#f8faf6] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Gejala Konflik
                      </p>
                      <p className="mt-1 text-lg font-bold text-[#154212]">
                        {topResult.negativeMatchCount}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-dashed border-[#e0e8d8] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <h3 className="mb-4 text-lg font-bold text-[#154212]">
                    Kelompok yang Dipilih
                  </h3>
                  <div className="mb-6 flex flex-wrap gap-3">
                    {data?.selectedKelompok?.map((kelompok) => (
                      <span
                        key={kelompok.id}
                        className="rounded-full bg-[#BAD36F]/20 px-4 py-2 text-sm font-semibold text-[#154212]"
                      >
                        {kelompok.label}
                      </span>
                    ))}
                  </div>

                  <h3 className="mb-4 text-lg font-bold text-[#154212]">
                    Gejala Paling Berpengaruh
                  </h3>
                  <div className="space-y-3">
                    {topResult.matchedGejala
                      .filter((gejala) => gejala.matchType === "support")
                      .sort((a, b) => b.cf - a.cf)
                      .slice(0, 5)
                      .map((gejala) => (
                        <div
                          key={gejala.id}
                          className="rounded-[16px] border border-gray-100 bg-[#f8faf6] p-4"
                        >
                          <div className="mb-2 flex items-start justify-between gap-3">
                            <p className="text-sm font-semibold text-[#154212]">
                              {gejala.label}
                            </p>
                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#154212]">
                              {Math.round(gejala.cf * 100)}%
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed text-gray-500">
                            {gejala.ket}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                <div className="rounded-[24px] border border-gray-100 bg-white p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <h3 className="mb-6 text-[17px] font-bold leading-snug text-[#154212]">
                    Rekomendasi Penanganan Jangka Pendek
                  </h3>
                  <ul className="space-y-4">
                    {treatment.penanganan.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#7a9a28]" />
                        <span className="text-[14px] font-medium leading-relaxed text-[#3a4435]">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[24px] border border-gray-100 bg-white p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <h3 className="mb-6 text-[17px] font-bold leading-snug text-[#154212]">
                    Strategi Pencegahan Jangka Panjang
                  </h3>
                  <ul className="space-y-4">
                    {treatment.pencegahan.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#7a9a28]" />
                        <span className="text-[14px] font-medium leading-relaxed text-[#3a4435]">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {supplementalRecommendation && (
                <div className="space-y-6">
                  {hasSupplementalWarnings && (
                    <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-6 py-5 text-sm text-amber-900">
                      <h3 className="mb-3 text-base font-bold text-[#154212]">
                        Beberapa tautan rekomendasi belum lengkap
                      </h3>
                      <div className="space-y-2 leading-relaxed">
                        {supplementalRecommendation.unresolvedMarketplaceProductIds
                          .length > 0 && (
                          <p>
                            Produk marketplace yang belum ditemukan:
                            {" "}
                            {supplementalRecommendation.unresolvedMarketplaceProductIds.join(
                              ", "
                            )}
                          </p>
                        )}
                        {supplementalRecommendation.unresolvedNonChemicalControlIds
                          .length > 0 && (
                          <p>
                            Pengendali non-kimia yang belum ditemukan:
                            {" "}
                            {supplementalRecommendation.unresolvedNonChemicalControlIds.join(
                              ", "
                            )}
                          </p>
                        )}
                        {supplementalRecommendation.missingMarketplaceProductImageIds
                          .length > 0 && (
                          <p>
                            Gambar produk marketplace yang belum tersedia:
                            {" "}
                            {supplementalRecommendation.missingMarketplaceProductImageIds.join(
                              ", "
                            )}
                          </p>
                        )}
                        {supplementalRecommendation.missingNonChemicalImageIds
                          .length > 0 && (
                          <p>
                            Gambar pengendali non-kimia yang belum tersedia:
                            {" "}
                            {supplementalRecommendation.missingNonChemicalImageIds.join(
                              ", "
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="rounded-[24px] border border-[#e3ecd8] bg-white p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    <div className="mb-6">
                      <h3 className="text-[20px] font-bold text-[#154212]">
                        Rekomendasi Produk dan Pengendali Relevan
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600">
                        SIPADI telah menghubungkan rekomendasi untuk{" "}
                        <strong>{supplementalRecommendation.nama}</strong> dengan
                        katalog produk kimia dan pengendali non-kimia yang
                        relevan.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                      {(
                        [
                          {
                            key: "kimia",
                            title: "Solusi Kimia",
                            items: supplementalRecommendation.solusi.kimia,
                          },
                          {
                            key: "mekanis",
                            title: "Solusi Mekanis",
                            items: supplementalRecommendation.solusi.mekanis,
                          },
                          {
                            key: "biologis",
                            title: "Solusi Biologis",
                            items: supplementalRecommendation.solusi.biologis,
                          },
                        ] as const
                      ).map((section) => (
                        <div
                          key={section.key}
                          className="rounded-[20px] bg-[#f8faf6] p-5"
                        >
                          <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#154212]">
                            {section.title}
                          </h4>
                          <ul className="space-y-3">
                            {section.items.map((item, index) => (
                              <li
                                key={`${section.key}-${index}`}
                                className="flex items-start gap-3"
                              >
                                <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#7a9a28]" />
                                <span className="text-sm leading-relaxed text-[#3a4435]">
                                  {item}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {supplementalRecommendation.productIds.marketplace.length > 0 ? (
                    <div className="rounded-[24px] border border-gray-100 bg-white p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                      <h3 className="mb-2 text-[18px] font-bold text-[#154212]">
                        Produk Marketplace Terkait
                      </h3>
                      <p className="mb-6 text-sm leading-relaxed text-gray-600">
                        Produk ini ditautkan langsung dari rekomendasi penyakit,
                        jadi daftar yang tampil tidak lagi bergantung pada
                        pencocokan teks manual.
                      </p>

                      {supplementalRecommendation.marketplaceProducts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                          {supplementalRecommendation.marketplaceProducts.map(
                            (product) => {
                              const hasImage =
                                !supplementalRecommendation.missingMarketplaceProductImageIds.includes(
                                  product.id
                                );

                              return (
                                <div
                                  key={product.id}
                                  className="overflow-hidden rounded-[22px] border border-[#e7eee0] bg-[#fcfdfa]"
                                >
                                  <div className="flex flex-col gap-5 p-5 sm:flex-row">
                                    <div className="flex h-32 w-full items-center justify-center rounded-[18px] bg-white sm:w-36">
                                      {hasImage ? (
                                        <img
                                          src={`/images/bahanaktif+kemasan/${product.imageFileName}`}
                                          alt={product.productName}
                                          className="h-full w-full rounded-[18px] object-contain p-3"
                                        />
                                      ) : (
                                        <div className="px-4 text-center text-xs font-semibold leading-relaxed text-gray-500">
                                          Gambar produk belum tersedia
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex-1">
                                      <div className="mb-3">
                                        <p className="text-xs font-bold uppercase tracking-wide text-[#7a9a28]">
                                          {product.category}
                                        </p>
                                        <h4 className="mt-1 text-lg font-bold text-[#154212]">
                                          {product.productName}
                                        </h4>
                                        <p className="text-sm text-gray-500">
                                          Bahan aktif: {product.activeIngredient}
                                        </p>
                                      </div>

                                      <p className="text-sm leading-relaxed text-gray-600">
                                        {product.catatanPenggunaan}
                                      </p>

                                      <div className="mt-4 flex flex-wrap gap-2">
                                        {(
                                          [
                                            ["Shopee", product.marketplaceLinks.shopee],
                                            [
                                              "Tokopedia",
                                              product.marketplaceLinks.tokopedia,
                                            ],
                                            ["Blibli", product.marketplaceLinks.blibli],
                                          ] as const
                                        ).map(
                                          ([label, href]) =>
                                            href && (
                                              <a
                                                key={`${product.id}-${label}`}
                                                href={href}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="rounded-full border border-[#154212]/15 bg-white px-3 py-1.5 text-xs font-bold text-[#154212] transition-colors hover:bg-[#eef5e8]"
                                              >
                                                {label}
                                              </a>
                                            )
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      ) : (
                        <div className="rounded-[20px] border border-dashed border-[#BAD36F]/40 bg-[#fafff0] px-6 py-6 text-sm leading-relaxed text-gray-600">
                          Belum ada produk marketplace yang bisa di-resolve dari
                          `productIds.marketplace` untuk penyakit ini.
                        </div>
                      )}
                    </div>
                  ) : null}

                  {supplementalRecommendation.productIds.nonKimia.length > 0 ? (
                    <div className="rounded-[24px] border border-gray-100 bg-white p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                      <h3 className="mb-2 text-[18px] font-bold text-[#154212]">
                        Pengendali Non-Kimia yang Relevan
                      </h3>
                      <p className="mb-6 text-sm leading-relaxed text-gray-600">
                        Item berikut terhubung langsung dari `productIds`
                        rekomendasi penyakit, sehingga bisa ditampilkan sebagai
                        alat, agen hayati, atau metode lapang pendukung.
                      </p>

                      {supplementalRecommendation.nonChemicalControls.length > 0 ? (
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                          {supplementalRecommendation.nonChemicalControls.map(
                            (item) => {
                              const hasImage =
                                !item.imageFileName ||
                                !supplementalRecommendation.missingNonChemicalImageIds.includes(
                                  item.id
                                );

                              return (
                                <div
                                  key={item.id}
                                  className="rounded-[22px] border border-[#e7eee0] bg-[#fcfdfa] p-5"
                                >
                                  <div className="flex flex-col gap-4 sm:flex-row">
                                    {item.imageFileName ? (
                                      <div className="flex h-28 w-full items-center justify-center rounded-[18px] bg-white sm:w-32">
                                        {hasImage ? (
                                          <img
                                            src={`/images/pengendali-non-kimia/${item.imageFileName}`}
                                            alt={item.nama}
                                            className="h-full w-full rounded-[18px] object-contain p-3"
                                          />
                                        ) : (
                                          <div className="px-4 text-center text-xs font-semibold leading-relaxed text-gray-500">
                                            Gambar item belum tersedia
                                          </div>
                                        )}
                                      </div>
                                    ) : null}

                                    <div className="flex-1">
                                      <p className="text-xs font-bold uppercase tracking-wide text-[#7a9a28]">
                                        {item.jenis}
                                      </p>
                                      <h4 className="mt-1 text-lg font-bold text-[#154212]">
                                        {item.nama}
                                      </h4>
                                      <p className="mt-3 text-sm leading-relaxed text-gray-600">
                                        {item.deskripsi}
                                      </p>
                                      <p className="mt-3 text-sm leading-relaxed text-gray-600">
                                        {item.catatanPenggunaan}
                                      </p>

                                      {item.marketplaceSearchLinks && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                          {(
                                            [
                                              [
                                                "Shopee",
                                                item.marketplaceSearchLinks.shopee,
                                              ],
                                              [
                                                "Tokopedia",
                                                item.marketplaceSearchLinks.tokopedia,
                                              ],
                                              [
                                                "Blibli",
                                                item.marketplaceSearchLinks.blibli,
                                              ],
                                            ] as const
                                          ).map(
                                            ([label, href]) =>
                                              href && (
                                                <a
                                                  key={`${item.id}-${label}`}
                                                  href={href}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="rounded-full border border-[#154212]/15 bg-white px-3 py-1.5 text-xs font-bold text-[#154212] transition-colors hover:bg-[#eef5e8]"
                                                >
                                                  {label}
                                                </a>
                                              )
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      ) : (
                        <div className="rounded-[20px] border border-dashed border-[#BAD36F]/40 bg-[#fafff0] px-6 py-6 text-sm leading-relaxed text-gray-600">
                          Belum ada pengendali non-kimia yang bisa di-resolve
                          dari `productIds.nonKimia` untuk penyakit ini.
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  onClick={() => window.print()}
                  className="w-full rounded-[12px] bg-[#154212] px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#154212]/90 sm:w-auto"
                >
                  Cetak Hasil Diagnosa
                </button>
                <Link
                  href="/pertanyaan"
                  className="flex w-full items-center justify-center rounded-[12px] border-2 border-[#154212] bg-white px-8 py-3.5 text-sm font-bold text-[#154212] transition-colors hover:bg-[#f0f4ec] sm:w-auto"
                >
                  Diagnosa Ulang
                </Link>
              </div>

              {results.length > 1 && (
                <div className="mt-16 border-t border-gray-200 pt-8">
                  <h4 className="mb-4 text-center text-sm font-bold uppercase tracking-wider text-gray-500">
                    Kemungkinan Diagnosis Lain
                  </h4>
                  <div className="flex flex-wrap justify-center gap-3">
                    {results.slice(1).map((result) => (
                      <div
                        key={result.penyakitId}
                        className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2"
                      >
                        <span className="text-sm font-bold text-[#154212]">
                          {result.nama}
                        </span>
                        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
                          {result.cfPercentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-[24px] border border-gray-100 bg-white p-12 text-center shadow-sm">
              <h3 className="mb-3 text-xl font-bold text-gray-800">
                Tidak Ditemukan Hasil
              </h3>
              <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-gray-500">
                Kombinasi gejala yang Anda pilih belum cukup kuat untuk melewati
                filtering backend. Silakan kembali dan pilih gejala yang lebih
                relevan atau tambahkan kelompok gejala lain.
              </p>
              <Link
                href="/pertanyaan"
                className="inline-flex items-center gap-2 rounded-[12px] bg-[#154212] px-8 py-3.5 font-bold text-white transition-all hover:bg-[#154212]/90"
              >
                Kembali Pilih Gejala
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
