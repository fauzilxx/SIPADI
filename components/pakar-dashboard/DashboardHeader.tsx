import type { SaveErrorCategoryKey, SaveState } from "@/components/pakar-dashboard/types";

export interface CategorizedSaveError {
  key: SaveErrorCategoryKey;
  title: string;
  description: string;
  actionHint: string;
  errors: string[];
}

export default function DashboardHeader({
  isAdmin,
  saving,
  loggingOut,
  dirty,
  validationErrors,
  saveState,
  categorizedSaveErrors,
  uncategorizedSaveErrors,
  onSave,
  onLogout,
}: {
  isAdmin: boolean;
  saving: boolean;
  loggingOut: boolean;
  dirty: boolean;
  validationErrors: string[];
  saveState: SaveState;
  categorizedSaveErrors: CategorizedSaveError[];
  uncategorizedSaveErrors: string[];
  onSave: () => void;
  onLogout: () => void;
}) {
  return (
    <section className="rounded-[28px] border border-[#d8e4d0] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-[#7a9a28]">
            {isAdmin ? "Admin Dashboard" : "Pakar Dashboard"}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#154212]">
            {isAdmin
              ? "Kelola Basis Pengetahuan dan Review Lapangan SIPADI"
              : "Ajukan Perbaikan Pengetahuan SIPADI"}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
            {isAdmin
              ? "Admin mereview feedback petani, memilih card publik, menyetujui usulan pakar, dan menyimpan perubahan knowledge base."
              : "Pakar berfokus pada pemantauan ringkas dan pengajuan usulan perubahan knowledge base tanpa mengubah data inti secara langsung."}
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          {isAdmin && (
            <button
              onClick={onSave}
              disabled={saving || !dirty || validationErrors.length > 0}
              className="rounded-2xl bg-[#154212] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12370f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          )}
          <button
            onClick={onLogout}
            disabled={loggingOut}
            className="rounded-2xl border border-[#154212] px-5 py-3 text-sm font-bold text-[#154212] transition hover:bg-[#f0f4ec] disabled:opacity-60"
          >
            {loggingOut ? "Keluar..." : "Keluar"}
          </button>
        </div>
      </div>

      {saveState.message &&
        (saveState.type === "success" ? (
          <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {saveState.message}
          </div>
        ) : (
          <div className="mt-5 space-y-4 rounded-[24px] border border-red-200 bg-red-50/80 px-4 py-4 text-sm text-red-700">
            <div>
              <p className="font-bold text-red-800">Penyimpanan belum berhasil</p>
              <p className="mt-1 leading-relaxed">{saveState.message}</p>
            </div>

            {categorizedSaveErrors.length > 0 && (
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
                {categorizedSaveErrors.map((category) => (
                  <div
                    key={category.key}
                    className="rounded-2xl border border-red-100 bg-white/70 p-4"
                  >
                    <h3 className="text-sm font-bold text-red-800">
                      {category.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-red-700/90">
                      {category.description}
                    </p>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-red-800">
                      Tindakan
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-red-700/90">
                      {category.actionHint}
                    </p>
                    <ul className="mt-3 space-y-2 text-sm leading-relaxed text-red-700">
                      {category.errors.map((error) => (
                        <li key={`${category.key}-${error}`}>- {error}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {uncategorizedSaveErrors.length > 0 && (
              <div className="rounded-2xl border border-red-100 bg-white/70 p-4">
                <p className="text-sm font-bold text-red-800">Detail Tambahan</p>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-red-700">
                  {uncategorizedSaveErrors.map((error) => (
                    <li key={error}>- {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}

      {isAdmin && validationErrors.length > 0 && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
          <p className="mb-2 font-bold">Validasi lokal menemukan masalah:</p>
          <ul className="space-y-1">
            {validationErrors.slice(0, 8).map((error) => (
              <li key={error}>- {error}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
