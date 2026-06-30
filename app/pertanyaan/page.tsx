"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import PublicLoginMenu from "@/components/PublicLoginMenu";
import {
  getGejalaByKelompokFromData,
  getKelompokLabel,
  type Gejala,
  type KelompokOption,
  type KnowledgeBaseData,
  type SelectedGejalaInput,
} from "@/lib/knowledge-base";

const STORAGE_KEY = "sipadi:selected-gejala";

export default function PertanyaanPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [knowledgeBaseData, setKnowledgeBaseData] =
    useState<KnowledgeBaseData | null>(null);
  const [knowledgeBaseMessage, setKnowledgeBaseMessage] = useState<string | null>(
    null
  );
  const [selectedKelompok, setSelectedKelompok] = useState<string[]>([]);
  const [selectedGejala, setSelectedGejala] = useState<Map<string, number>>(
    new Map()
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadKnowledgeBase() {
      try {
        const response = await fetch("/api/knowledge-base/public", {
          signal: controller.signal,
        });
        const payload = (await response.json()) as {
          success: boolean;
          gejala?: Gejala[];
          message?: string;
        };

        if (!response.ok || !payload.success || !payload.gejala) {
          setKnowledgeBaseMessage(
            payload.message ?? "Knowledge base publik belum dapat dimuat."
          );
          return;
        }

        setKnowledgeBaseData({
          _meta: {},
          cf_formula: {},
          penyakit: [],
          gejala: payload.gejala,
        });
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        setKnowledgeBaseMessage("Knowledge base publik belum dapat dimuat.");
      }
    }

    loadKnowledgeBase();

    return () => controller.abort();
  }, []);

  const kelompokOptions = useMemo(() => {
    if (!knowledgeBaseData) {
      return [];
    }

    const grouped = new Map<string, number>();

    for (const gejala of knowledgeBaseData.gejala) {
      grouped.set(gejala.kelompok, (grouped.get(gejala.kelompok) ?? 0) + 1);
    }

    return Array.from(grouped.entries()).map(([id, gejalaCount]) => ({
      id,
      label: getKelompokLabel(id),
      gejalaCount,
    }));
  }, [knowledgeBaseData]);
  const gejalaList = useMemo(
    () =>
      knowledgeBaseData
        ? getGejalaByKelompokFromData(knowledgeBaseData, selectedKelompok)
        : [],
    [knowledgeBaseData, selectedKelompok]
  );

  const groupedGejala = useMemo(() => {
    const groups = new Map<string, Gejala[]>();

    for (const gejala of gejalaList) {
      if (!groups.has(gejala.kelompok)) {
        groups.set(gejala.kelompok, []);
      }

      groups.get(gejala.kelompok)!.push(gejala);
    }

    return Array.from(groups.entries());
  }, [gejalaList]);

  const toggleKelompok = (kelompokId: string) => {
    setSelectedKelompok((previous) => {
      if (previous.includes(kelompokId)) {
        setSelectedGejala((current) => {
          const next = new Map(current);
          for (const gejala of gejalaList.filter(
            (item) => item.kelompok === kelompokId
          )) {
            next.delete(gejala.id);
          }
          return next;
        });

        return previous.filter((id) => id !== kelompokId);
      }

      return [...previous, kelompokId];
    });
  };

  const toggleGejala = (id: string) => {
    setSelectedGejala((previous) => {
      const next = new Map(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.set(id, 1);
      }
      return next;
    });
  };

  const updateCf = (id: string, cf: number) => {
    setSelectedGejala((previous) => {
      const next = new Map(previous);
      if (next.has(id)) {
        next.set(id, cf);
      }
      return next;
    });
  };

  const clearAll = () => {
    setSelectedKelompok([]);
    setSelectedGejala(new Map());
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const submitDiagnosis = () => {
    const payload: SelectedGejalaInput[] = Array.from(selectedGejala.entries()).map(
      ([id, cfUser]) => ({
        id,
        cfUser,
      })
    );

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    router.push("/hasil");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
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
                className="mx-3 px-1 py-2 text-sm font-semibold text-green-dark transition-colors duration-300"
              >
                Pertanyaan
              </Link>
              <Link
                href="/hasil"
                className="mx-3 px-1 py-2 text-sm font-semibold text-text-muted transition-colors duration-300 hover:text-green-dark"
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
                  className="rounded-lg bg-green-pale/80 px-4 py-3 text-sm font-semibold text-green-dark transition-colors"
                >
                  Pertanyaan
                </Link>
                <Link
                  href="/hasil"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-semibold text-text-muted transition-colors hover:bg-green-pale"
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
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-12">
          <div className="mb-10 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#BAD36F]/30 bg-[#BAD36F]/20 px-4 py-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-green-dark">
                Proses Diagnosa
              </span>
            </div>

            <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-green-dark sm:text-4xl lg:text-[2.75rem]">
              Pilih Kelompok Gejala Terlebih Dahulu
            </h1>
            <p className="mx-auto max-w-3xl text-sm leading-relaxed text-text-muted sm:text-base">
              Alur SIPADI sekarang lebih terarah. Pilih kelompok gejala yang
              Anda lihat, lalu centang gejala spesifik di dalam kelompok
              tersebut. Anda tetap boleh membuka lebih dari satu kelompok
              sebelum menjalankan diagnosis.
            </p>
          </div>

          <div className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <div className="w-full rounded-[12px] border border-[#b8c7b4] bg-[#fffff6] px-6 py-4 shadow-sm sm:w-[260px]">
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-dark text-base font-bold text-white">
                  1
                </div>
                <span className="text-base font-bold text-green-dark">
                  Pilih Kelompok
                </span>
              </div>
            </div>

            <div className="w-full rounded-[12px] bg-[#fffff6] px-6 py-4 sm:w-[260px]">
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#b9c0b5] text-base font-bold text-white">
                  2
                </div>
                <span className="text-base font-bold text-[#8a9184]">
                  Pilih Gejala
                </span>
              </div>
            </div>

            <div className="w-full rounded-[12px] bg-[#fffff6] px-6 py-4 sm:w-[260px]">
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#b9c0b5] text-base font-bold text-white">
                  3
                </div>
                <span className="text-base font-bold text-[#8a9184]">
                  Hasil Diagnosa
                </span>
              </div>
            </div>
          </div>

          <section className="mb-8 rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-green-dark">
                  Kelompok Gejala
                </h2>
                <p className="text-sm text-text-muted">
                  Mulai dari kategori yang paling mendekati kondisi di lapangan.
                </p>
              </div>
              {selectedKelompok.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-sm font-semibold text-text-muted underline underline-offset-2 transition-colors hover:text-red-500"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {kelompokOptions.map((kelompok) => {
                const isSelected = selectedKelompok.includes(kelompok.id);

                return (
                  <button
                    key={kelompok.id}
                    type="button"
                    onClick={() => toggleKelompok(kelompok.id)}
                    className={`rounded-[20px] border p-5 text-left transition-all duration-200 ${
                      isSelected
                        ? "border-[#BAD36F] bg-[#BAD36F]/15 shadow-md ring-1 ring-[#BAD36F]/30"
                        : "border-gray-200 bg-white hover:border-[#BAD36F]/50 hover:bg-[#fafff0] hover:shadow-md"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#BAD36F] text-sm font-bold text-green-dark">
                        {kelompok.id}
                      </div>
                      <span className="rounded-full bg-[#154212]/8 px-3 py-1 text-xs font-semibold text-green-dark">
                        {kelompok.gejalaCount} gejala
                      </span>
                    </div>
                    <h3 className="mb-2 text-base font-bold text-green-dark">
                      {kelompok.label}
                    </h3>
                    <p className="text-sm text-text-muted">
                      {isSelected
                        ? "Kelompok ini aktif. Gejala terkait sudah tersedia di bawah."
                        : "Pilih kelompok ini untuk membuka daftar gejala spesifik."}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm sm:p-8 md:p-10">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-green-dark">
                  Gejala Spesifik
                </h2>
                <p className="text-sm text-text-muted">
                  Hanya gejala dari kelompok yang Anda pilih yang akan
                  ditampilkan.
                </p>
              </div>
              <div className="text-sm font-semibold text-green-dark">
                {selectedGejala.size} gejala dipilih
              </div>
            </div>

            {!knowledgeBaseData && !knowledgeBaseMessage ? (
              <div className="rounded-[20px] border border-dashed border-[#BAD36F]/40 bg-[#fafff0] px-6 py-10 text-center">
                <p className="text-sm leading-relaxed text-text-muted">
                  Sedang memuat knowledge base gejala terbaru...
                </p>
              </div>
            ) : knowledgeBaseMessage ? (
              <div className="rounded-[20px] border border-dashed border-red-200 bg-red-50 px-6 py-10 text-center">
                <p className="text-sm leading-relaxed text-red-600">
                  {knowledgeBaseMessage}
                </p>
              </div>
            ) : selectedKelompok.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-[#BAD36F]/40 bg-[#fafff0] px-6 py-10 text-center">
                <p className="text-sm leading-relaxed text-text-muted">
                  Belum ada kelompok yang dipilih. Pilih minimal satu kelompok
                  gejala terlebih dahulu untuk melanjutkan ke checklist gejala.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {groupedGejala.map(([kelompokId, items]) => (
                  <div key={kelompokId}>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#BAD36F] shadow-sm">
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
                      <h3 className="text-base font-bold text-green-dark">
                        {
                          kelompokOptions.find((item) => item.id === kelompokId)
                            ?.label
                        }
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {items.map((gejala) => {
                        const isSelected = selectedGejala.has(gejala.id);
                        const value = selectedGejala.get(gejala.id) ?? 1;

                        return (
                          <div
                            key={gejala.id}
                            className={`rounded-[16px] border p-4 transition-all duration-200 ${
                              isSelected
                                ? "border-[#BAD36F] bg-[#BAD36F]/15 shadow-md ring-1 ring-[#BAD36F]/30"
                                : "border-gray-200 bg-white hover:border-[#BAD36F]/50 hover:bg-[#fafff0] hover:shadow-md"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => toggleGejala(gejala.id)}
                              className="flex w-full items-start gap-3.5 text-left"
                            >
                              <div
                                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 ${
                                  isSelected
                                    ? "scale-105 border-green-dark bg-green-dark"
                                    : "border-gray-300"
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
                              <span
                                className={`text-sm leading-snug ${
                                  isSelected
                                    ? "font-semibold text-green-dark"
                                    : "font-medium text-text-dark"
                                }`}
                              >
                                {gejala.label}
                              </span>
                            </button>

                            {isSelected && (
                              <div className="mt-4 w-full border-t border-[#BAD36F]/30 px-1 pt-3">
                                <div className="mb-2 flex items-center justify-between">
                                  <span className="text-xs font-semibold text-green-dark">
                                    Tingkat Keyakinan
                                  </span>
                                  <span className="rounded-full bg-green-dark px-2 py-0.5 text-xs font-bold text-white">
                                    {Math.round(value * 100)}%
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min="10"
                                  max="100"
                                  step="1"
                                  value={Math.round(value * 100)}
                                  onChange={(event) =>
                                    updateCf(
                                      gejala.id,
                                      Number(event.target.value) / 100
                                    )
                                  }
                                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-green-dark/20 accent-[#154212]"
                                />
                                <div className="mt-1 flex justify-between px-0.5">
                                  <span className="text-[10px] font-medium text-green-dark/70">
                                    10%
                                  </span>
                                  <span className="text-[10px] font-medium text-green-dark/70">
                                    100%
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-10 flex flex-col items-center gap-4">
              <button
                type="button"
                disabled={selectedGejala.size === 0}
                onClick={submitDiagnosis}
                className={`inline-flex items-center gap-2.5 rounded-xl px-10 py-4 text-base font-bold transition-all duration-300 ${
                  selectedGejala.size > 0
                    ? "bg-green-dark text-white hover:-translate-y-0.5 hover:bg-green-dark/95 hover:shadow-xl hover:shadow-green-dark/20"
                    : "cursor-not-allowed bg-gray-200 text-gray-400"
                }`}
              >
                Lihat Hasil Diagnosa
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
