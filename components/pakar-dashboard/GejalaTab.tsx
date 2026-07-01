import type { KnowledgeBaseData } from "@/lib/knowledge-base";

import type { GejalaProposalDraft } from "@/components/pakar-dashboard/types";

export default function GejalaTab({
  isAdmin,
  workingData,
  canCreateGejalaDirectly,
  gejalaProposalDrafts,
  newGejalaDraft,
  submittingGejalaProposalId,
  hasGejalaDraftChanges,
  isNewGejalaDraftReady,
  onAddGejala,
  onDeleteGejala,
  onUpdateGejala,
  onUpdateGejalaProposalDraft,
  onUpdateNewGejalaDraft,
  onUpdateNewGejalaRelationRule,
  onSubmitGejalaProposal,
}: {
  isAdmin: boolean;
  workingData: KnowledgeBaseData;
  canCreateGejalaDirectly: boolean;
  gejalaProposalDrafts: Record<string, GejalaProposalDraft>;
  newGejalaDraft: GejalaProposalDraft;
  submittingGejalaProposalId: string | null;
  hasGejalaDraftChanges: (gejalaId: string) => boolean;
  isNewGejalaDraftReady: () => boolean;
  onAddGejala: () => void;
  onDeleteGejala: (index: number) => void;
  onUpdateGejala: (
    index: number,
    field: "id" | "label" | "kelompok",
    value: string
  ) => void;
  onUpdateGejalaProposalDraft: (
    gejalaId: string,
    field: "id" | "label" | "kelompok",
    value: string
  ) => void;
  onUpdateNewGejalaDraft: (
    field: "id" | "label" | "kelompok",
    value: string
  ) => void;
  onUpdateNewGejalaRelationRule: (
    penyakitId: string,
    field: "cf" | "ket",
    value: string
  ) => void;
  onSubmitGejalaProposal: (mode: "create" | "update", gejalaId: string) => void;
}) {
  return (
    <section className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
      <KelompokInfo />
      {isAdmin ? (
        <AdminGejalaEditor
          workingData={workingData}
          canCreateGejalaDirectly={canCreateGejalaDirectly}
          onAddGejala={onAddGejala}
          onDeleteGejala={onDeleteGejala}
          onUpdateGejala={onUpdateGejala}
        />
      ) : (
        <PakarGejalaEditor
          workingData={workingData}
          gejalaProposalDrafts={gejalaProposalDrafts}
          newGejalaDraft={newGejalaDraft}
          submittingGejalaProposalId={submittingGejalaProposalId}
          hasGejalaDraftChanges={hasGejalaDraftChanges}
          isNewGejalaDraftReady={isNewGejalaDraftReady}
          onUpdateGejalaProposalDraft={onUpdateGejalaProposalDraft}
          onUpdateNewGejalaDraft={onUpdateNewGejalaDraft}
          onUpdateNewGejalaRelationRule={onUpdateNewGejalaRelationRule}
          onSubmitGejalaProposal={onSubmitGejalaProposal}
        />
      )}
    </section>
  );
}

function KelompokInfo() {
  return (
    <div className="mb-6 rounded-[24px] border border-[#d9e5d1] bg-[#f8faf6] p-5">
      <h3 className="text-sm font-bold uppercase tracking-wide text-[#154212]">
        Keterangan Kelompok Gejala
      </h3>
      <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-gray-700 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["A", "Gejala pada daun"],
          ["B", "Gejala pada batang dan anakan"],
          ["C", "Gejala pada malai dan bulir"],
          ["D", "Tanda organisme dan pola serangan"],
          ["E", "Kondisi lingkungan"],
        ].map(([label, description]) => (
          <div key={label} className="rounded-2xl bg-white px-4 py-3">
            <p className="font-bold text-[#154212]">{label}</p>
            <p className="mt-1">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminGejalaEditor({
  workingData,
  canCreateGejalaDirectly,
  onAddGejala,
  onDeleteGejala,
  onUpdateGejala,
}: {
  workingData: KnowledgeBaseData;
  canCreateGejalaDirectly: boolean;
  onAddGejala: () => void;
  onDeleteGejala: (index: number) => void;
  onUpdateGejala: (
    index: number,
    field: "id" | "label" | "kelompok",
    value: string
  ) => void;
}) {
  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#154212]">Kelola Gejala</h2>
          <p className="text-sm text-gray-600">
            Admin dapat menambah, mengubah, atau menghapus gejala langsung dari
            knowledge base utama.
          </p>
        </div>
        <button
          onClick={onAddGejala}
          disabled={!canCreateGejalaDirectly}
          className="rounded-2xl bg-[#BAD36F] px-4 py-2.5 text-sm font-bold text-[#154212] transition hover:bg-[#a9c55c] disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Tambah Gejala Baru
        </button>
      </div>

      <div className="space-y-4">
        {workingData.gejala.map((gejala, index) => (
          <div
            key={`${gejala.id}-${index}`}
            className="grid grid-cols-1 gap-3 rounded-2xl border border-[#edf2e8] bg-[#fbfcfa] p-4 lg:grid-cols-[0.8fr_2fr_0.8fr_auto]"
          >
            <input
              value={gejala.id}
              onChange={(event) => onUpdateGejala(index, "id", event.target.value)}
              className="rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
            />
            <input
              value={gejala.label}
              onChange={(event) =>
                onUpdateGejala(index, "label", event.target.value)
              }
              className="rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
            />
            <select
              value={gejala.kelompok}
              onChange={(event) =>
                onUpdateGejala(index, "kelompok", event.target.value)
              }
              className="rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
            </select>
            <button
              onClick={() => onDeleteGejala(index)}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
            >
              Hapus
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function PakarGejalaEditor({
  workingData,
  gejalaProposalDrafts,
  newGejalaDraft,
  submittingGejalaProposalId,
  hasGejalaDraftChanges,
  isNewGejalaDraftReady,
  onUpdateGejalaProposalDraft,
  onUpdateNewGejalaDraft,
  onUpdateNewGejalaRelationRule,
  onSubmitGejalaProposal,
}: {
  workingData: KnowledgeBaseData;
  gejalaProposalDrafts: Record<string, GejalaProposalDraft>;
  newGejalaDraft: GejalaProposalDraft;
  submittingGejalaProposalId: string | null;
  hasGejalaDraftChanges: (gejalaId: string) => boolean;
  isNewGejalaDraftReady: () => boolean;
  onUpdateGejalaProposalDraft: (
    gejalaId: string,
    field: "id" | "label" | "kelompok",
    value: string
  ) => void;
  onUpdateNewGejalaDraft: (
    field: "id" | "label" | "kelompok",
    value: string
  ) => void;
  onUpdateNewGejalaRelationRule: (
    penyakitId: string,
    field: "cf" | "ket",
    value: string
  ) => void;
  onSubmitGejalaProposal: (mode: "create" | "update", gejalaId: string) => void;
}) {
  return (
    <>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#154212]">Kelola Gejala</h2>
          <p className="text-sm text-gray-600">
            Input gejala di sini sudah disamakan dengan format final knowledge
            base. Pakar mengisi sekali, lalu admin cukup review dan validasi
            tanpa mengetik ulang.
          </p>
        </div>
        <div className="rounded-full bg-[#eef5e8] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#154212]">
          Mode Usulan Final
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-[#dce9b9] bg-[#fbfde9] px-4 py-4 text-sm text-[#7f6a1d]">
        Perubahan dari tab ini tidak langsung mengubah knowledge base. Setiap
        submit akan masuk ke antrean usulan pakar dengan data final yang siap
        direview admin.
      </div>

      <div className="space-y-4">
        <div className="rounded-[24px] border border-[#edf2e8] bg-[#fbfcfa] p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#154212]">
                + Tambah Gejala Baru
              </h3>
              <p className="text-sm text-gray-600">
                Isi data sesuai format final yang diinginkan di knowledge base.
              </p>
            </div>
            <button
              onClick={() => onSubmitGejalaProposal("create", "new")}
              disabled={
                submittingGejalaProposalId === "new" || !isNewGejalaDraftReady()
              }
              className="rounded-2xl bg-[#BAD36F] px-4 py-2.5 text-sm font-bold text-[#154212] transition hover:bg-[#a9c55c] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submittingGejalaProposalId === "new"
                ? "Mengirim..."
                : "Kirim Usulan"}
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[0.8fr_2fr_0.8fr]">
            <input
              value={newGejalaDraft.id}
              readOnly
              aria-readonly="true"
              placeholder="ID otomatis"
              className="cursor-not-allowed rounded-xl border border-[#d9e5d1] bg-gray-100 px-3 py-2.5 text-sm text-gray-500 outline-none"
            />
            <input
              value={newGejalaDraft.label}
              onChange={(event) =>
                onUpdateNewGejalaDraft("label", event.target.value)
              }
              placeholder="Tuliskan label gejala baru"
              className="rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
            />
            <select
              value={newGejalaDraft.kelompok}
              onChange={(event) =>
                onUpdateNewGejalaDraft("kelompok", event.target.value)
              }
              className="rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
            </select>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1.2fr_0.6fr_1.6fr]">
            <div className="lg:col-span-3">
              <div className="mb-3 rounded-2xl border border-[#dce9b9] bg-[#f8fbef] px-4 py-3 text-sm text-[#5f6f2c]">
                Isi CF untuk penyakit/hama yang relevan. Nilai minus
                diperbolehkan. Jika dibiarkan kosong, sistem akan menyimpan CF
                default <strong>0</strong> saat admin menerapkan usulan.
              </div>
              <div className="space-y-3">
                {workingData.penyakit.map((penyakit) => {
                  const relationRule = newGejalaDraft.relationRules[penyakit.id] ?? {
                    cf: "0",
                    ket: "",
                  };

                  return (
                    <div
                      key={`relation-${penyakit.id}`}
                      className="grid grid-cols-1 gap-3 rounded-2xl border border-[#e7eddc] bg-white px-4 py-4 lg:grid-cols-[1.2fr_0.5fr_1.6fr]"
                    >
                      <div>
                        <p className="text-sm font-bold text-[#154212]">
                          {penyakit.id} - {penyakit.nama}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Kosong = default 0
                        </p>
                      </div>
                      <input
                        type="number"
                        min="-1"
                        max="1"
                        step="0.05"
                        value={relationRule.cf}
                        onChange={(event) =>
                          onUpdateNewGejalaRelationRule(
                            penyakit.id,
                            "cf",
                            event.target.value
                          )
                        }
                        placeholder="0"
                        className="rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
                      />
                      <input
                        value={relationRule.ket}
                        onChange={(event) =>
                          onUpdateNewGejalaRelationRule(
                            penyakit.id,
                            "ket",
                            event.target.value
                          )
                        }
                        placeholder="Keterangan opsional. Jika kosong, sistem isi otomatis."
                        className="rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {workingData.gejala.map((gejala) => {
          const draft = gejalaProposalDrafts[gejala.id] ?? {
            id: gejala.id,
            label: gejala.label,
            kelompok: gejala.kelompok,
            relationRules: {},
          };
          const hasChanges = hasGejalaDraftChanges(gejala.id);

          return (
            <div
              key={gejala.id}
              className="rounded-[24px] border border-[#edf2e8] bg-[#fbfcfa] p-4"
            >
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#154212]">
                    {gejala.id}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Perbarui label atau kelompok gejala, lalu kirim sebagai
                    usulan final-format.
                  </p>
                </div>
                <button
                  onClick={() => onSubmitGejalaProposal("update", gejala.id)}
                  disabled={submittingGejalaProposalId === gejala.id || !hasChanges}
                  className="rounded-2xl border border-[#154212] px-4 py-2.5 text-sm font-bold text-[#154212] transition hover:bg-[#f0f4ec] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submittingGejalaProposalId === gejala.id
                    ? "Mengirim..."
                    : "Kirim Revisi"}
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[0.8fr_2fr_0.8fr]">
                <input
                  value={draft.id}
                  readOnly
                  aria-readonly="true"
                  className="cursor-not-allowed rounded-xl border border-[#d9e5d1] bg-gray-100 px-3 py-2.5 text-sm text-gray-500 outline-none"
                />
                <input
                  value={draft.label}
                  onChange={(event) =>
                    onUpdateGejalaProposalDraft(
                      gejala.id,
                      "label",
                      event.target.value
                    )
                  }
                  className="rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
                />
                <select
                  value={draft.kelompok}
                  onChange={(event) =>
                    onUpdateGejalaProposalDraft(
                      gejala.id,
                      "kelompok",
                      event.target.value
                    )
                  }
                  className="rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
