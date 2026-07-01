import type { PublicFeedbackCard } from "@/components/hasil/types";

export default function PublicFeedbackSection({
  cards,
}: {
  cards: PublicFeedbackCard[];
}) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[24px] border border-gray-100 bg-white p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div className="mb-6">
        <h3 className="text-[20px] font-bold text-[#154212]">
          Suara Petani Lain
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Berikut beberapa feedback petani yang sudah direview dan disetujui
          admin untuk ditampilkan.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {cards.slice(0, 6).map((card) => (
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
  );
}
