"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import PublicLoginMenu from "@/components/PublicLoginMenu";
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

interface FeedbackSummary {
  totalFeedback: number;
  totalAccurate: number;
  totalInaccurate: number;
  accuracyPercentage: number;
  averageRating: number;
}

interface PublicFeedbackCard {
  id: string;
  diagnosisNama: string;
  isAccurate: boolean;
  rating: number;
  comment: string;
}

interface FeedbackApiResponse {
  success: boolean;
  message?: string;
  errors?: string[];
  summary?: FeedbackSummary;
  publicCards?: PublicFeedbackCard[];
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
  const [feedbackSummary, setFeedbackSummary] = useState<FeedbackSummary | null>(
    null
  );
  const [publicFeedbackCards, setPublicFeedbackCards] = useState<
    PublicFeedbackCard[]
  >([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    isAccurate: "" as "" | "yes" | "no",
    rating: 5,
    comment: "",
  });

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

        setErrorMessage("Hasil diagnosis belum bisa dimuat. Silakan coba lagi.");
        setLoading(false);
      }
    }

    runDiagnosis();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadFeedbackData() {
      try {
        const response = await fetch("/api/feedback", {
          signal: controller.signal,
        });
        const payload = (await response.json()) as FeedbackApiResponse;

        if (!response.ok || !payload.success) {
          setFeedbackLoading(false);
          return;
        }

        setFeedbackSummary(payload.summary ?? null);
        setPublicFeedbackCards(payload.publicCards ?? []);
        setFeedbackLoading(false);
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        setFeedbackLoading(false);
      }
    }

    loadFeedbackData();

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcfdfa]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#BAD36F] border-t-[#154212]" />
          <p className="text-sm font-semibold text-[#154212]">
            Sedang menyiapkan hasil diagnosis...
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

  async function handleSubmitFeedback(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!topResult) {
      return;
    }

    if (!feedbackForm.isAccurate) {
      setFeedbackMessage("Silakan pilih apakah hasil diagnosis ini sesuai.");
      return;
    }

    setFeedbackSubmitting(true);
    setFeedbackMessage(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          diagnosisPenyakitId: topResult.penyakitId,
          diagnosisNama: topResult.nama,
          diagnosisConfidence: topResult.cfPercentage,
          isAccurate: feedbackForm.isAccurate === "yes",
          rating: feedbackForm.rating,
          comment: feedbackForm.comment,
          selectedGejala: data?.selectedGejala ?? [],
        }),
      });

      const payload = (await response.json()) as FeedbackApiResponse;

      if (!response.ok || !payload.success) {
        setFeedbackMessage(
          payload.errors?.join(" ") ??
            payload.message ??
            "Feedback belum bisa disimpan."
        );
        setFeedbackSubmitting(false);
        return;
      }

      setFeedbackSummary(payload.summary ?? null);
      setFeedbackMessage(
        payload.message ??
          "Terima kasih, feedback Anda berhasil disimpan dan menunggu review admin."
      );
      setFeedbackForm({
        isAccurate: "",
        rating: 5,
        comment: "",
      });
      setFeedbackSubmitting(false);
    } catch {
      setFeedbackMessage("Feedback belum bisa disimpan. Silakan coba lagi.");
      setFeedbackSubmitting(false);
    }
  }

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
                <PublicLoginMenu
                  variant="mobile"
                  onNavigate={() => setMobileMenuOpen(false)}
                />
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
                    Berdasarkan gejala yang Anda pilih, kondisi padi Anda paling
                    mendekati{" "}
                    <strong className="text-[#154212]">{topResult.nama}</strong>.
                    Gunakan hasil ini sebagai panduan awal untuk memeriksa
                    tanaman di lapangan dan menentukan langkah penanganan yang
                    paling sesuai.
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
                        Berikut ringkasan cara pengendalian yang dapat
                        dipertimbangkan untuk{" "}
                        <strong>{supplementalRecommendation.nama}</strong>,
                        mulai dari tindakan kimia, mekanis, hingga biologis.
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
                        Daftar ini berisi contoh produk yang bisa Anda pelajari
                        lebih lanjut sesuai hasil diagnosis. Selalu baca label,
                        ikuti dosis anjuran, dan utamakan penggunaan yang aman
                        di lapangan.
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
                          Belum ada contoh produk yang ditampilkan untuk hasil
                          diagnosis ini.
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
                        Bagian ini menampilkan pilihan pengendalian non-kimia
                        yang dapat membantu, seperti alat, agen hayati, atau
                        metode lapang pendukung.
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
                          Belum ada rekomendasi pengendalian non-kimia yang
                          ditampilkan untuk hasil diagnosis ini.
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}

              <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr]">
                <div className="rounded-[24px] border border-gray-100 bg-white p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <h3 className="mb-2 text-[20px] font-bold text-[#154212]">
                    Ringkasan Feedback Program
                  </h3>
                  <p className="mb-6 text-sm leading-relaxed text-gray-600">
                    Ringkasan ini berasal dari feedback petani yang masuk dan
                    membantu memantau tingkat akurasi serta kepuasan terhadap
                    program SIPADI.
                  </p>

                  {feedbackLoading ? (
                    <p className="text-sm text-gray-500">
                      Sedang memuat ringkasan feedback...
                    </p>
                  ) : feedbackSummary ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-[18px] bg-[#f8faf6] p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Tingkat Akurasi
                        </p>
                        <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                          {feedbackSummary.accuracyPercentage}%
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-gray-500">
                          Dari {feedbackSummary.totalFeedback} feedback yang
                          sudah masuk.
                        </p>
                      </div>

                      <div className="rounded-[18px] bg-[#f8faf6] p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Rating Program
                        </p>
                        <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                          {feedbackSummary.averageRating}/5
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-gray-500">
                          {feedbackSummary.totalAccurate} sesuai,{" "}
                          {feedbackSummary.totalInaccurate} belum sesuai.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Belum ada feedback yang tersimpan.
                    </p>
                  )}
                </div>

                <div className="rounded-[24px] border border-[#dce8d2] bg-white p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <h3 className="mb-2 text-[20px] font-bold text-[#154212]">
                    Beri Feedback Hasil Diagnosis
                  </h3>
                  <p className="mb-6 text-sm leading-relaxed text-gray-600">
                    Feedback Anda akan disimpan, direview admin, lalu dipakai
                    untuk menilai keakuratan dan meningkatkan kualitas program.
                  </p>

                  <form className="space-y-5" onSubmit={handleSubmitFeedback}>
                    <div>
                      <p className="mb-3 text-sm font-semibold text-[#154212]">
                        Apakah hasil diagnosis ini sesuai dengan kondisi sawah
                        Anda?
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() =>
                            setFeedbackForm((current) => ({
                              ...current,
                              isAccurate: "yes",
                            }))
                          }
                          className={`rounded-[18px] border px-4 py-3 text-sm font-semibold transition-colors ${
                            feedbackForm.isAccurate === "yes"
                              ? "border-[#154212] bg-[#eef5e8] text-[#154212]"
                              : "border-[#d9e5d1] bg-white text-gray-600 hover:bg-[#f8faf6]"
                          }`}
                        >
                          Ya, sesuai
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFeedbackForm((current) => ({
                              ...current,
                              isAccurate: "no",
                            }))
                          }
                          className={`rounded-[18px] border px-4 py-3 text-sm font-semibold transition-colors ${
                            feedbackForm.isAccurate === "no"
                              ? "border-[#154212] bg-[#eef5e8] text-[#154212]"
                              : "border-[#d9e5d1] bg-white text-gray-600 hover:bg-[#f8faf6]"
                          }`}
                        >
                          Belum sesuai
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#154212]">
                        Rating Program
                      </label>
                      <select
                        value={feedbackForm.rating}
                        onChange={(event) =>
                          setFeedbackForm((current) => ({
                            ...current,
                            rating: Number(event.target.value),
                          }))
                        }
                        className="w-full rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm text-[#154212] outline-none focus:border-[#7a9a28] focus:ring-2 focus:ring-[#BAD36F]/40"
                      >
                        <option value={5}>5 - Sangat membantu</option>
                        <option value={4}>4 - Membantu</option>
                        <option value={3}>3 - Cukup membantu</option>
                        <option value={2}>2 - Kurang membantu</option>
                        <option value={1}>1 - Tidak membantu</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#154212]">
                        Catatan Tambahan
                      </label>
                      <textarea
                        value={feedbackForm.comment}
                        onChange={(event) =>
                          setFeedbackForm((current) => ({
                            ...current,
                            comment: event.target.value,
                          }))
                        }
                        maxLength={500}
                        rows={4}
                        placeholder="Tuliskan kondisi lapang atau hal yang menurut Anda perlu diperbaiki."
                        className="min-h-28 w-full rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm text-[#154212] outline-none focus:border-[#7a9a28] focus:ring-2 focus:ring-[#BAD36F]/40"
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        {feedbackForm.comment.length}/500 karakter
                      </p>
                    </div>

                    {feedbackMessage && (
                      <div className="rounded-2xl border border-[#d9e5d1] bg-[#f8faf6] px-4 py-3 text-sm text-[#154212]">
                        {feedbackMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={feedbackSubmitting}
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-[#154212] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#12370f] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {feedbackSubmitting
                        ? "Menyimpan feedback..."
                        : "Kirim Feedback"}
                    </button>
                  </form>
                </div>
              </section>

              {publicFeedbackCards.length > 0 && (
                <section className="rounded-[24px] border border-gray-100 bg-white p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="mb-6">
                    <h3 className="text-[20px] font-bold text-[#154212]">
                      Suara Petani Lain
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      Berikut beberapa feedback petani yang sudah direview dan
                      disetujui admin untuk ditampilkan.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {publicFeedbackCards.slice(0, 6).map((card) => (
                      <div
                        key={card.id}
                        className="rounded-[20px] border border-[#e7eee0] bg-[#fcfdfa] p-5"
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <span className="rounded-full bg-[#eef5e8] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#154212]">
                            {card.diagnosisNama}
                          </span>
                          <span className="text-sm font-bold text-[#7a9a28]">
                            {card.rating}/5
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-[#3a4435]">
                          {card.comment || "Feedback disetujui tanpa catatan tambahan."}
                        </p>
                        <p className="mt-4 text-xs font-semibold text-gray-500">
                          {card.isAccurate
                            ? "Hasil dinilai sesuai kondisi lapang"
                            : "Hasil dinilai belum sepenuhnya sesuai"}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
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
                Gejala yang Anda pilih belum cukup kuat untuk menunjukkan satu
                masalah utama pada tanaman. Silakan kembali, pilih gejala yang
                paling sesuai dengan kondisi di sawah, atau tambahkan gejala
                lain yang juga terlihat.
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
