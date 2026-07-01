import type { KnowledgeBaseData } from "@/lib/knowledge-base";

import type { ChangeRequestEntry, FeedbackEntry, FeedbackSummary } from "@/components/pakar-dashboard/types";

export default function OverviewTab({
  isAdmin,
  workingData,
  feedbackSummary,
  publicFeedbackCards,
  visibleChangeRequests,
  onUpdateMeta,
  onUpdateThreshold,
}: {
  isAdmin: boolean;
  workingData: KnowledgeBaseData;
  feedbackSummary: FeedbackSummary | null;
  publicFeedbackCards: FeedbackEntry[];
  visibleChangeRequests: ChangeRequestEntry[];
  onUpdateMeta: (field: string, value: string) => void;
  onUpdateThreshold: (value: number) => void;
}) {
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-[#154212]">
            Ringkasan Dataset
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#f8faf6] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Total Gejala
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                {workingData.gejala.length}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f8faf6] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Total Penyakit/Hama
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                {workingData.penyakit.length}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f8faf6] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Versi Data
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                {String(workingData._meta.versi ?? "-")}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f8faf6] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Threshold CF
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                {Number(workingData.cf_formula.threshold_tampil ?? 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-[#154212]">
            {isAdmin ? "Monitor Feedback dan Review" : "Ringkasan Peran Pakar"}
          </h2>
          <div
            className={`grid grid-cols-1 gap-4 ${
              isAdmin ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2"
            }`}
          >
            <div className="rounded-2xl bg-[#f8faf6] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {isAdmin ? "Total Feedback" : "Total Usulan"}
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                {isAdmin
                  ? feedbackSummary?.totalFeedback ?? 0
                  : visibleChangeRequests.length}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f8faf6] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {isAdmin ? "Akurasi" : "Menunggu Review"}
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                {isAdmin
                  ? `${feedbackSummary?.accuracyPercentage ?? 0}%`
                  : visibleChangeRequests.filter((item) => item.status === "pending")
                      .length}
              </p>
            </div>
            {isAdmin && (
              <div className="rounded-2xl bg-[#f8faf6] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Rating
                </p>
                <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                  {feedbackSummary?.averageRating ?? 0}/5
                </p>
              </div>
            )}
            {isAdmin && (
              <div className="rounded-2xl bg-[#f8faf6] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Card Publik
                </p>
                <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                  {publicFeedbackCards.length}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {isAdmin ? (
          <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-[#154212]">
              Konfigurasi Inti
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#154212]">
                  Nama Proyek
                </label>
                <input
                  value={String(workingData._meta.nama_proyek ?? "")}
                  onChange={(event) =>
                    onUpdateMeta("nama_proyek", event.target.value)
                  }
                  className="w-full rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28] focus:ring-2 focus:ring-[#BAD36F]/40"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#154212]">
                  Versi Data
                </label>
                <input
                  value={String(workingData._meta.versi ?? "")}
                  onChange={(event) => onUpdateMeta("versi", event.target.value)}
                  className="w-full rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28] focus:ring-2 focus:ring-[#BAD36F]/40"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#154212]">
                  Threshold Tampil
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={Number(workingData.cf_formula.threshold_tampil ?? 0.2)}
                  onChange={(event) =>
                    onUpdateThreshold(Number(event.target.value))
                  }
                  className="w-full rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28] focus:ring-2 focus:ring-[#BAD36F]/40"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-[#154212]">
              Alur Kerja Pakar
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-gray-600">
              <p>
                Pakar dapat mengajukan koreksi gejala melalui tab Kelola Gejala
                dengan format final knowledge base, lalu memakai tab usulan
                untuk aturan CF, solusi, pencegahan, atau catatan umum.
              </p>
              <p>
                Admin akan meninjau usulan tersebut sebelum perubahan
                diterapkan ke knowledge base utama.
              </p>
              <p>
                Review feedback petani dan publikasi card testimoni dikelola
                khusus oleh admin agar alur publik tetap terjaga.
              </p>
            </div>
          </div>
        )}

        <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-[#154212]">
            Antrean Usulan Pakar
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#f8faf6] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Total Usulan
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                {visibleChangeRequests.length}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f8faf6] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Menunggu Review
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                {
                  visibleChangeRequests.filter((item) => item.status === "pending")
                    .length
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
