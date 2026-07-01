import { formatDateLabel } from "@/components/pakar-dashboard/helpers";
import type {
  FeedbackEntry,
  FeedbackSummary,
  SaveState,
} from "@/components/pakar-dashboard/types";

export default function FeedbackTab({
  feedbackState,
  feedbackSummary,
  feedbackLoading,
  feedbackEntries,
  publicFeedbackCards,
  feedbackNotes,
  feedbackStatusDraft,
  feedbackPublicDraft,
  updatingFeedbackId,
  onFeedbackStatusDraftChange,
  onFeedbackPublicDraftChange,
  onFeedbackNotesChange,
  onReviewFeedback,
}: {
  feedbackState: SaveState;
  feedbackSummary: FeedbackSummary | null;
  feedbackLoading: boolean;
  feedbackEntries: FeedbackEntry[];
  publicFeedbackCards: FeedbackEntry[];
  feedbackNotes: Record<string, string>;
  feedbackStatusDraft: Record<string, FeedbackEntry["reviewStatus"]>;
  feedbackPublicDraft: Record<string, boolean>;
  updatingFeedbackId: string | null;
  onFeedbackStatusDraftChange: (
    feedbackId: string,
    status: FeedbackEntry["reviewStatus"]
  ) => void;
  onFeedbackPublicDraftChange: (feedbackId: string, value: boolean) => void;
  onFeedbackNotesChange: (feedbackId: string, value: string) => void;
  onReviewFeedback: (feedbackId: string) => void;
}) {
  return (
    <section className="space-y-6">
      {feedbackState.message && (
        <div
          className={`rounded-2xl px-4 py-3 text-sm font-medium ${
            feedbackState.type === "success"
              ? "border border-green-200 bg-green-50 text-green-700"
              : "border border-red-200 bg-red-50 text-red-600"
          }`}
        >
          {feedbackState.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <MetricCard
          label="Total Feedback"
          value={feedbackSummary?.totalFeedback ?? 0}
        />
        <MetricCard label="Sesuai" value={feedbackSummary?.totalAccurate ?? 0} />
        <MetricCard
          label="Belum Sesuai"
          value={feedbackSummary?.totalInaccurate ?? 0}
        />
        <MetricCard label="Card Publik" value={publicFeedbackCards.length} />
      </div>

      {feedbackLoading ? (
        <StateCard message="Sedang memuat feedback petani..." />
      ) : feedbackEntries.length === 0 ? (
        <StateCard message="Belum ada feedback petani yang masuk." />
      ) : (
        <div className="space-y-5">
          {feedbackEntries.map((feedback) => (
            <div
              key={feedback.id}
              className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#eef5e8] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#154212]">
                      {feedback.diagnosisNama}
                    </span>
                    <span className="rounded-full bg-[#f8faf6] px-3 py-1 text-xs font-semibold text-[#154212]">
                      Rating {feedback.rating}/5
                    </span>
                    <span className="rounded-full bg-[#f8faf6] px-3 py-1 text-xs font-semibold text-[#154212]">
                      {feedback.isAccurate
                        ? "Dinilai sesuai"
                        : "Dinilai belum sesuai"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#154212]">
                    Feedback #{feedback.id}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-[#154212]">
                    Oleh {feedback.submitterName}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Dikirim {formatDateLabel(feedback.submittedAt)} | Confidence
                    hasil {feedback.diagnosisConfidence}%
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f8faf6] px-4 py-3 text-sm text-[#154212]">
                  Status review:{" "}
                  <strong className="capitalize">{feedback.reviewStatus}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
                <div className="space-y-4">
                  <div className="rounded-2xl bg-[#f8faf6] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Catatan Petani
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-700">
                      {feedback.comment || "Petani tidak menambahkan catatan."}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f8faf6] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Gejala Terpilih
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {feedback.selectedGejala.map((item) => (
                        <span
                          key={`${feedback.id}-${item.id}`}
                          className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#154212]"
                        >
                          {item.id} | {Math.round(item.cfUser * 100)}%
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#154212]">
                      Status Review Admin
                    </label>
                    <select
                      value={feedbackStatusDraft[feedback.id] ?? feedback.reviewStatus}
                      onChange={(event) =>
                        onFeedbackStatusDraftChange(
                          feedback.id,
                          event.target.value as FeedbackEntry["reviewStatus"]
                        )
                      }
                      className="w-full rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28]"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-3 rounded-2xl border border-[#d9e5d1] bg-[#f8faf6] px-4 py-3 text-sm text-[#154212]">
                    <input
                      type="checkbox"
                      checked={
                        feedbackPublicDraft[feedback.id] ?? feedback.showAsPublicCard
                      }
                      onChange={(event) =>
                        onFeedbackPublicDraftChange(
                          feedback.id,
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 accent-[#154212]"
                    />
                    Tampilkan sebagai card publik setelah disetujui
                  </label>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#154212]">
                      Catatan Reviewer
                    </label>
                    <textarea
                      value={feedbackNotes[feedback.id] ?? ""}
                      onChange={(event) =>
                        onFeedbackNotesChange(feedback.id, event.target.value)
                      }
                      rows={4}
                      className="min-h-24 w-full rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-gray-500">
                      Terakhir direview: {formatDateLabel(feedback.reviewedAt)}
                    </p>
                    <button
                      onClick={() => onReviewFeedback(feedback.id)}
                      disabled={updatingFeedbackId === feedback.id}
                      className="rounded-2xl bg-[#154212] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#12370f] disabled:opacity-60"
                    >
                      {updatingFeedbackId === feedback.id
                        ? "Menyimpan..."
                        : "Simpan Review"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {publicFeedbackCards.length > 0 && (
        <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-[#154212]">
            Preview Card Feedback Publik
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {publicFeedbackCards.map((card) => (
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
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {card.submitterName}
                </p>
                <p className="text-sm leading-relaxed text-[#3a4435]">
                  {card.comment || "Feedback publik tanpa catatan tambahan."}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold text-[#154212]">{value}</p>
    </div>
  );
}

function StateCard({ message }: { message: string }) {
  return (
    <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
