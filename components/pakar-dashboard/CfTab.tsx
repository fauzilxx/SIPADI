import type { KnowledgeBaseData } from "@/lib/knowledge-base";

export default function CfTab({
  workingData,
  onAddRule,
  onDeleteRule,
  onUpdateRule,
}: {
  workingData: KnowledgeBaseData;
  onAddRule: (penyakitIndex: number) => void;
  onDeleteRule: (penyakitIndex: number, ruleIndex: number) => void;
  onUpdateRule: (
    penyakitIndex: number,
    ruleIndex: number,
    field: "gejala_id" | "cf" | "ket",
    value: string
  ) => void;
}) {
  return (
    <section className="space-y-6">
      {workingData.penyakit.map((penyakit, penyakitIndex) => (
        <div
          key={`${penyakit.id}-cf`}
          className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#154212]">
                {penyakit.id} - {penyakit.nama}
              </h2>
              <p className="text-sm text-gray-600">
                Admin dapat menambah, mengubah, atau menghapus relasi gejala
                beserta nilai CF untuk {penyakit.nama}.
              </p>
            </div>
            <button
              onClick={() => onAddRule(penyakitIndex)}
              className="rounded-2xl bg-[#BAD36F] px-4 py-2.5 text-sm font-bold text-[#154212] transition hover:bg-[#a9c55c]"
            >
              + Tambah Relasi
            </button>
          </div>

          <div className="space-y-4">
            {penyakit.aturan.map((rule, ruleIndex) => (
              <div
                key={`${penyakit.id}-${rule.gejala_id}-${ruleIndex}`}
                className="grid grid-cols-1 gap-3 rounded-2xl border border-[#edf2e8] bg-[#fbfcfa] p-4 lg:grid-cols-[1.2fr_0.6fr_1.8fr_auto]"
              >
                <div>
                  <select
                    value={rule.gejala_id}
                    onChange={(event) =>
                      onUpdateRule(
                        penyakitIndex,
                        ruleIndex,
                        "gejala_id",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
                  >
                    {workingData.gejala.map((gejala) => (
                      <option
                        key={`${penyakit.id}-${gejala.id}`}
                        value={gejala.id}
                      >
                        {gejala.id} - {gejala.label}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="number"
                  min="-1"
                  max="1"
                  step="0.05"
                  value={rule.cf}
                  onChange={(event) =>
                    onUpdateRule(penyakitIndex, ruleIndex, "cf", event.target.value)
                  }
                  className="rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
                />
                <textarea
                  value={rule.ket}
                  onChange={(event) =>
                    onUpdateRule(penyakitIndex, ruleIndex, "ket", event.target.value)
                  }
                  className="min-h-20 rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
                />
                <button
                  onClick={() => onDeleteRule(penyakitIndex, ruleIndex)}
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
