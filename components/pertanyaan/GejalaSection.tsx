import type { Gejala, KelompokOption } from "@/lib/knowledge-base";

export default function GejalaSection({
  groupedGejala,
  kelompokOptions,
  knowledgeBaseReady,
  knowledgeBaseMessage,
  selectedKelompok,
  selectedGejala,
  onToggleGejala,
  onUpdateCf,
  onSubmitDiagnosis,
}: {
  groupedGejala: [string, Gejala[]][];
  kelompokOptions: KelompokOption[];
  knowledgeBaseReady: boolean;
  knowledgeBaseMessage: string | null;
  selectedKelompok: string[];
  selectedGejala: Map<string, number>;
  onToggleGejala: (id: string) => void;
  onUpdateCf: (id: string, cf: number) => void;
  onSubmitDiagnosis: () => void;
}) {
  return (
    <section className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm sm:p-8 md:p-10">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-green-dark">Gejala Spesifik</h2>
          <p className="text-sm text-text-muted">
            Hanya gejala dari kelompok yang Anda pilih yang akan ditampilkan.
          </p>
        </div>
        <div className="text-sm font-semibold text-green-dark">
          {selectedGejala.size} gejala dipilih
        </div>
      </div>

      {!knowledgeBaseReady && !knowledgeBaseMessage ? (
        <InfoState message="Sedang memuat knowledge base gejala terbaru..." />
      ) : knowledgeBaseMessage ? (
        <InfoState error message={knowledgeBaseMessage} />
      ) : selectedKelompok.length === 0 ? (
        <InfoState message="Belum ada kelompok yang dipilih. Pilih minimal satu kelompok gejala terlebih dahulu untuk melanjutkan ke checklist gejala." />
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
                  {kelompokOptions.find((item) => item.id === kelompokId)?.label}
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
                        onClick={() => onToggleGejala(gejala.id)}
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
                              onUpdateCf(
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
          onClick={onSubmitDiagnosis}
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
  );
}

function InfoState({
  message,
  error = false,
}: {
  message: string;
  error?: boolean;
}) {
  return (
    <div
      className={`rounded-[20px] border border-dashed px-6 py-10 text-center ${
        error
          ? "border-red-200 bg-red-50"
          : "border-[#BAD36F]/40 bg-[#fafff0]"
      }`}
    >
      <p
        className={`text-sm leading-relaxed ${
          error ? "text-red-600" : "text-text-muted"
        }`}
      >
        {message}
      </p>
    </div>
  );
}
