import type { KelompokOption } from "@/lib/knowledge-base";

export default function KelompokSection({
  kelompokOptions,
  selectedKelompok,
  onToggleKelompok,
  onClearAll,
}: {
  kelompokOptions: KelompokOption[];
  selectedKelompok: string[];
  onToggleKelompok: (kelompokId: string) => void;
  onClearAll: () => void;
}) {
  return (
    <section className="mb-8 rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-green-dark">Kelompok Gejala</h2>
          <p className="text-sm text-text-muted">
            Mulai dari kategori yang paling mendekati kondisi di lapangan.
          </p>
        </div>
        {selectedKelompok.length > 0 && (
          <button
            onClick={onClearAll}
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
              onClick={() => onToggleKelompok(kelompok.id)}
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
  );
}
