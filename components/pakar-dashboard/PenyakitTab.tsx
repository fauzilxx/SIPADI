import type { KnowledgeBaseData } from "@/lib/knowledge-base";

export default function PenyakitTab({
  workingData,
  canCreatePenyakitDirectly,
  onAddPenyakit,
  onDeletePenyakit,
  onUpdatePenyakitField,
  onAddTreatmentItem,
  onDeleteTreatmentItem,
  onUpdateTreatmentList,
}: {
  workingData: KnowledgeBaseData;
  canCreatePenyakitDirectly: boolean;
  onAddPenyakit: () => void;
  onDeletePenyakit: (index: number) => void;
  onUpdatePenyakitField: (
    index: number,
    field: "id" | "nama" | "jenis" | "organisme",
    value: string
  ) => void;
  onAddTreatmentItem: (
    penyakitIndex: number,
    type: "penanganan" | "pencegahan"
  ) => void;
  onDeleteTreatmentItem: (
    penyakitIndex: number,
    type: "penanganan" | "pencegahan",
    itemIndex: number
  ) => void;
  onUpdateTreatmentList: (
    penyakitIndex: number,
    type: "penanganan" | "pencegahan",
    itemIndex: number,
    value: string
  ) => void;
}) {
  return (
    <section className="space-y-5">
      <div className="flex justify-end">
        <button
          onClick={onAddPenyakit}
          disabled={!canCreatePenyakitDirectly}
          className="rounded-2xl bg-[#BAD36F] px-4 py-2.5 text-sm font-bold text-[#154212] transition hover:bg-[#a9c55c] disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Tambah Penyakit/Hama
        </button>
      </div>
      {workingData.penyakit.map((penyakit, index) => (
        <div
          key={`${penyakit.id}-${index}`}
          className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#154212]">
                {penyakit.id} - {penyakit.nama}
              </h2>
              <p className="text-sm text-gray-600">
                Admin dapat mengubah atau menghapus penyakit/hama ini langsung.
              </p>
            </div>
            <button
              onClick={() => onDeletePenyakit(index)}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
            >
              Hapus
            </button>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1.6fr_1fr_1.2fr]">
            <input
              value={penyakit.id}
              onChange={(event) =>
                onUpdatePenyakitField(index, "id", event.target.value.toUpperCase())
              }
              className="rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
            />
            <input
              value={penyakit.nama}
              onChange={(event) =>
                onUpdatePenyakitField(index, "nama", event.target.value)
              }
              className="rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
            />
            <select
              value={penyakit.jenis}
              onChange={(event) =>
                onUpdatePenyakitField(index, "jenis", event.target.value)
              }
              className="rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
            >
              <option value="hama">Hama</option>
              <option value="penyakit">Penyakit</option>
            </select>
            <input
              value={penyakit.organisme ?? ""}
              onChange={(event) =>
                onUpdatePenyakitField(index, "organisme", event.target.value)
              }
              className="rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
              placeholder="Organisme (opsional)"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TreatmentCard
              title="Penanganan Jangka Pendek"
              items={penyakit.solusi?.penanganan ?? []}
              onAdd={() => onAddTreatmentItem(index, "penanganan")}
              onDelete={(itemIndex) =>
                onDeleteTreatmentItem(index, "penanganan", itemIndex)
              }
              onChange={(itemIndex, value) =>
                onUpdateTreatmentList(index, "penanganan", itemIndex, value)
              }
            />
            <TreatmentCard
              title="Pencegahan Jangka Panjang"
              items={penyakit.solusi?.pencegahan ?? []}
              onAdd={() => onAddTreatmentItem(index, "pencegahan")}
              onDelete={(itemIndex) =>
                onDeleteTreatmentItem(index, "pencegahan", itemIndex)
              }
              onChange={(itemIndex, value) =>
                onUpdateTreatmentList(index, "pencegahan", itemIndex, value)
              }
            />
          </div>
        </div>
      ))}
    </section>
  );
}

function TreatmentCard({
  title,
  items,
  onAdd,
  onDelete,
  onChange,
}: {
  title: string;
  items: string[];
  onAdd: () => void;
  onDelete: (itemIndex: number) => void;
  onChange: (itemIndex: number, value: string) => void;
}) {
  return (
    <div className="rounded-2xl bg-[#f8faf6] p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#154212]">{title}</h3>
        <button onClick={onAdd} className="text-xs font-bold text-[#154212]">
          + Tambah
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, itemIndex) => (
          <div
            key={`${title}-${itemIndex}`}
            className="flex items-start gap-3"
          >
            <textarea
              value={item}
              onChange={(event) => onChange(itemIndex, event.target.value)}
              className="min-h-20 w-full rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
            />
            <button
              onClick={() => onDelete(itemIndex)}
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
            >
              Hapus
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
