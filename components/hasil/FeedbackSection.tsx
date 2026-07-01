import type { FormEvent } from "react";

import type {
  FeedbackFormState,
  FeedbackSummary,
} from "@/components/hasil/types";

export default function FeedbackSection({
  summary,
  feedbackLoading,
  feedbackForm,
  feedbackMessage,
  feedbackSubmitting,
  onSubmit,
  onChange,
}: {
  summary: FeedbackSummary | null;
  feedbackLoading: boolean;
  feedbackForm: FeedbackFormState;
  feedbackMessage: string | null;
  feedbackSubmitting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: <K extends keyof FeedbackFormState>(
    field: K,
    value: FeedbackFormState[K]
  ) => void;
}) {
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="rounded-[24px] border border-gray-100 bg-white p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <h3 className="mb-2 text-[20px] font-bold text-[#154212]">
          Ringkasan Feedback Program
        </h3>
        <p className="mb-6 text-sm leading-relaxed text-gray-600">
          Ringkasan ini berasal dari feedback petani yang masuk dan membantu
          memantau tingkat akurasi serta kepuasan terhadap program SIPADI.
        </p>

        {feedbackLoading ? (
          <p className="text-sm text-gray-500">
            Sedang memuat ringkasan feedback...
          </p>
        ) : summary ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-[18px] bg-[#f8faf6] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Tingkat Akurasi
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                {summary.accuracyPercentage}%
              </p>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                Dari {summary.totalFeedback} feedback yang sudah masuk.
              </p>
            </div>

            <div className="rounded-[18px] bg-[#f8faf6] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Rating Program
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                {summary.averageRating}/5
              </p>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                {summary.totalAccurate} sesuai, {summary.totalInaccurate} belum
                sesuai.
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
          Feedback Anda akan disimpan, direview admin, lalu dipakai untuk menilai
          keakuratan dan meningkatkan kualitas program.
        </p>

        <form className="space-y-5" onSubmit={onSubmit}>
          <div>
            <label
              htmlFor="feedback-name"
              className="mb-2 block text-sm font-semibold text-[#154212]"
            >
              Nama
            </label>
            <input
              id="feedback-name"
              type="text"
              maxLength={100}
              value={feedbackForm.submitterName}
              onChange={(event) => onChange("submitterName", event.target.value)}
              className="w-full rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm text-[#154212] outline-none focus:border-[#7a9a28] focus:ring-2 focus:ring-[#BAD36F]/40"
              placeholder="Contoh: Budi Santoso"
              required
            />
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-[#154212]">
              Apakah hasil diagnosis ini sesuai dengan kondisi sawah Anda?
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <AccuracyButton
                active={feedbackForm.isAccurate === "yes"}
                label="Ya, sesuai"
                onClick={() => onChange("isAccurate", "yes")}
              />
              <AccuracyButton
                active={feedbackForm.isAccurate === "no"}
                label="Belum sesuai"
                onClick={() => onChange("isAccurate", "no")}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#154212]">
              Rating Program
            </label>
            <select
              value={feedbackForm.rating}
              onChange={(event) => onChange("rating", Number(event.target.value))}
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
              onChange={(event) => onChange("comment", event.target.value)}
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
            {feedbackSubmitting ? "Menyimpan feedback..." : "Kirim Feedback"}
          </button>
        </form>
      </div>
    </section>
  );
}

function AccuracyButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[18px] border px-4 py-3 text-sm font-semibold transition-colors ${
        active
          ? "border-[#154212] bg-[#eef5e8] text-[#154212]"
          : "border-[#d9e5d1] bg-white text-gray-600 hover:bg-[#f8faf6]"
      }`}
    >
      {label}
    </button>
  );
}
