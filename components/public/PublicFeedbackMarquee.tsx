import type { PublicFeedbackCard } from "@/components/hasil/types";

export default function PublicFeedbackMarquee({
  cards,
  title = "Pengalaman Pengguna",
  description,
}: {
  cards: PublicFeedbackCard[];
  title?: string;
  description?: string;
}) {
  if (cards.length === 0) {
    return null;
  }

  const marqueeCards =
    cards.length <= 1 ? cards : [...cards, ...cards];

  return (
    <section className="pb-10 md:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        <div className="mb-10 text-center animate-fade-in-up">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#BAD36F]/30 bg-[#BAD36F]/15 px-4 py-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#154212]">
              Cerita Pengguna
            </span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#154212] sm:text-4xl">
            {title}
          </h2>
          {description ? (
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-text-muted sm:text-base">
              {description}
            </p>
          ) : null}
        </div>

        <div className="relative overflow-hidden rounded-[32px] border border-[#dce7d3] bg-white/70 py-5 shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#fafaf5] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#fafaf5] to-transparent" />

          <div
            className={`flex gap-4 px-4 ${
              cards.length > 1
                ? "w-max animate-feedback-marquee"
                : "w-full justify-start"
            }`}
          >
            {marqueeCards.map((card, index) => (
              <article
                key={`${card.id}-${index}`}
                className="w-[280px] flex-shrink-0 rounded-[24px] border border-[#e6eee1] bg-[#fcfdfa] p-5 shadow-[0_12px_24px_rgba(21,66,18,0.06)]"
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
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
