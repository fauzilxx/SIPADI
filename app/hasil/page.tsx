"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import AlternativeResults from "@/components/hasil/AlternativeResults";
import DiagnosisSummarySection from "@/components/hasil/DiagnosisSummarySection";
import FeedbackSection from "@/components/hasil/FeedbackSection";
import { EmptyState, ErrorState, LoadingState } from "@/components/hasil/HasilStates";
import PublicFeedbackSection from "@/components/hasil/PublicFeedbackSection";
import SupplementalRecommendationsSection from "@/components/hasil/SupplementalRecommendationsSection";
import type {
  DiagnosisApiResponse,
  FeedbackApiResponse,
  FeedbackFormState,
  FeedbackSummary,
  PublicFeedbackCard,
} from "@/components/hasil/types";
import PublicSiteNavbar from "@/components/public/PublicSiteNavbar";
import { getPenyakitImageAsset, type SelectedGejalaInput } from "@/lib/knowledge-base";

const STORAGE_KEY = "sipadi:selected-gejala";

const defaultFeedbackForm: FeedbackFormState = {
  submitterName: "",
  isAccurate: "",
  rating: 5,
  comment: "",
};

export default function HasilPage() {
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
  const [feedbackForm, setFeedbackForm] =
    useState<FeedbackFormState>(defaultFeedbackForm);

  useEffect(() => {
    const controller = new AbortController();

    async function runDiagnosis() {
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

  const results = data?.results ?? [];
  const topResult = data?.topResult ?? null;
  const treatment = data?.treatment ?? null;
  const supplementalRecommendation = data?.supplementalRecommendation ?? null;
  const hasResults = Boolean(topResult && treatment);
  const penyakitImage = topResult
    ? getPenyakitImageAsset(topResult.penyakitId)
    : null;

  function updateFeedbackForm<K extends keyof FeedbackFormState>(
    field: K,
    value: FeedbackFormState[K]
  ) {
    setFeedbackForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!topResult) {
      return;
    }

    if (!feedbackForm.isAccurate) {
      setFeedbackMessage("Silakan pilih apakah hasil diagnosis ini sesuai.");
      return;
    }

    if (!feedbackForm.submitterName.trim()) {
      setFeedbackMessage("Silakan isi nama Anda sebelum mengirim feedback.");
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
          submitterName: feedbackForm.submitterName,
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
      setFeedbackForm(defaultFeedbackForm);
      setFeedbackSubmitting(false);
    } catch {
      setFeedbackMessage("Feedback belum bisa disimpan. Silakan coba lagi.");
      setFeedbackSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fcfdfa] font-sans">
      <PublicSiteNavbar activePage="diagnosis" />

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
            <ErrorState message={errorMessage} />
          ) : hasResults && topResult && treatment ? (
            <div className="space-y-8">
              <DiagnosisSummarySection
                topResult={topResult}
                topResultLabel={data?.topResultLabel}
                totalSelectedGejala={data?.totalSelectedGejala}
                selectedKelompok={data?.selectedKelompok}
                treatment={treatment}
                penyakitImage={penyakitImage}
              />

              {supplementalRecommendation ? (
                <SupplementalRecommendationsSection
                  recommendation={supplementalRecommendation}
                />
              ) : null}

              <FeedbackSection
                summary={feedbackSummary}
                feedbackLoading={feedbackLoading}
                feedbackForm={feedbackForm}
                feedbackMessage={feedbackMessage}
                feedbackSubmitting={feedbackSubmitting}
                onSubmit={handleSubmitFeedback}
                onChange={updateFeedbackForm}
              />

              <PublicFeedbackSection cards={publicFeedbackCards} />

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

              <AlternativeResults results={results} />
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </main>
    </div>
  );
}
