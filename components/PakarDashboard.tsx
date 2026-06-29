"use client";

import { useMemo, useState } from "react";

import {
  validateKnowledgeBaseData,
  type KnowledgeBaseData,
} from "@/lib/knowledge-base";

type TabKey = "overview" | "gejala" | "penyakit" | "cf";

interface SaveState {
  type: "idle" | "success" | "error";
  message: string;
}

const tabs: { id: TabKey; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "gejala", label: "Kelola Gejala" },
  { id: "penyakit", label: "Penyakit & Solusi" },
  { id: "cf", label: "Matriks CF" },
];

export default function PakarDashboard({
  initialData,
}: {
  initialData: KnowledgeBaseData;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [workingData, setWorkingData] = useState<KnowledgeBaseData>(initialData);
  const [saveState, setSaveState] = useState<SaveState>({
    type: "idle",
    message: "",
  });
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const dirty = JSON.stringify(workingData) !== JSON.stringify(initialData);
  const validation = useMemo(
    () => validateKnowledgeBaseData(workingData),
    [workingData]
  );

  const gejalaMap = useMemo(() => {
    return new Map(workingData.gejala.map((gejala) => [gejala.id, gejala.label]));
  }, [workingData.gejala]);

  function updateMeta(field: string, value: string) {
    setWorkingData((current) => ({
      ...current,
      _meta: {
        ...current._meta,
        [field]: value,
      },
    }));
  }

  function updateThreshold(value: number) {
    setWorkingData((current) => ({
      ...current,
      cf_formula: {
        ...current.cf_formula,
        threshold_tampil: value,
      },
    }));
  }

  function updateGejala(index: number, field: "id" | "label" | "kelompok", value: string) {
    setWorkingData((current) => {
      const gejala = [...current.gejala];
      gejala[index] = {
        ...gejala[index],
        [field]: value,
      };
      return { ...current, gejala };
    });
  }

  function addGejala() {
    setWorkingData((current) => ({
      ...current,
      gejala: [
        ...current.gejala,
        {
          id: `G${String(current.gejala.length + 1).padStart(2, "0")}`,
          label: "Gejala baru",
          kelompok: "A",
        },
      ],
    }));
  }

  function updatePenyakitField(
    index: number,
    field: "id" | "nama" | "jenis" | "organisme",
    value: string
  ) {
    setWorkingData((current) => {
      const penyakit = [...current.penyakit];
      penyakit[index] = {
        ...penyakit[index],
        [field]: value,
      };
      return { ...current, penyakit };
    });
  }

  function addPenyakit() {
    setWorkingData((current) => ({
      ...current,
      penyakit: [
        ...current.penyakit,
        {
          id: `P${String(current.penyakit.length + 1).padStart(2, "0")}`,
          nama: "Penyakit atau hama baru",
          jenis: "penyakit",
          aturan: current.gejala.slice(0, 1).map((gejala) => ({
            gejala_id: gejala.id,
            cf: 0,
            ket: "Aturan baru belum dikonfigurasi.",
          })),
          solusi: {
            penanganan: [""],
            pencegahan: [""],
          },
        },
      ],
    }));
  }

  function updateTreatmentList(
    penyakitIndex: number,
    type: "penanganan" | "pencegahan",
    itemIndex: number,
    value: string
  ) {
    setWorkingData((current) => {
      const penyakit = [...current.penyakit];
      const currentPenyakit = penyakit[penyakitIndex];
      const solusi = currentPenyakit.solusi ?? {
        penanganan: [""],
        pencegahan: [""],
      };
      const nextItems = [...solusi[type]];
      nextItems[itemIndex] = value;
      penyakit[penyakitIndex] = {
        ...currentPenyakit,
        solusi: {
          ...solusi,
          [type]: nextItems,
        },
      };
      return { ...current, penyakit };
    });
  }

  function addTreatmentItem(
    penyakitIndex: number,
    type: "penanganan" | "pencegahan"
  ) {
    setWorkingData((current) => {
      const penyakit = [...current.penyakit];
      const currentPenyakit = penyakit[penyakitIndex];
      const solusi = currentPenyakit.solusi ?? {
        penanganan: [],
        pencegahan: [],
      };

      penyakit[penyakitIndex] = {
        ...currentPenyakit,
        solusi: {
          ...solusi,
          [type]: [...solusi[type], ""],
        },
      };

      return { ...current, penyakit };
    });
  }

  function updateRule(
    penyakitIndex: number,
    ruleIndex: number,
    field: "cf" | "ket",
    value: string
  ) {
    setWorkingData((current) => {
      const penyakit = [...current.penyakit];
      const rules = [...penyakit[penyakitIndex].aturan];
      rules[ruleIndex] = {
        ...rules[ruleIndex],
        [field]: field === "cf" ? Number(value) : value,
      };
      penyakit[penyakitIndex] = {
        ...penyakit[penyakitIndex],
        aturan: rules,
      };
      return { ...current, penyakit };
    });
  }

  async function handleSave() {
    setSaving(true);
    setSaveState({ type: "idle", message: "" });

    try {
      const response = await fetch("/api/pakar/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: workingData }),
      });

      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
        errors?: string[];
      };

      if (!response.ok || !payload.success) {
        setSaveState({
          type: "error",
          message:
            payload.errors?.join(" ") ??
            payload.message ??
            "Gagal menyimpan perubahan.",
        });
        setSaving(false);
        return;
      }

      setSaveState({
        type: "success",
        message: payload.message ?? "Perubahan berhasil disimpan.",
      });
      setSaving(false);
      window.location.reload();
    } catch {
      setSaveState({
        type: "error",
        message: "Tidak dapat terhubung ke API simpan.",
      });
      setSaving(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await fetch("/api/pakar/logout", { method: "POST" });
    } finally {
      window.location.reload();
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-[#d8e4d0] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-[#7a9a28]">
              Expert Dashboard
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#154212]">
              Kelola Basis Pengetahuan SIPADI
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
              Ubah gejala, penyakit, solusi, dan nilai Certainty Factor langsung
              dari dashboard pakar. Perubahan akan divalidasi dan dicadangkan
              sebelum disimpan ke file knowledge base.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <span className="rounded-full bg-[#eef5e8] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#154212]">
              {dirty ? "Ada perubahan belum disimpan" : "Data sinkron"}
            </span>
            <button
              onClick={handleSave}
              disabled={saving || !dirty || validation.errors.length > 0}
              className="rounded-2xl bg-[#154212] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12370f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-2xl border border-[#154212] px-5 py-3 text-sm font-bold text-[#154212] transition hover:bg-[#f0f4ec] disabled:opacity-60"
            >
              {loggingOut ? "Keluar..." : "Keluar"}
            </button>
          </div>
        </div>

        {saveState.message && (
          <div
            className={`mt-5 rounded-2xl px-4 py-3 text-sm font-medium ${
              saveState.type === "success"
                ? "border border-green-200 bg-green-50 text-green-700"
                : "border border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {saveState.message}
          </div>
        )}

        {validation.errors.length > 0 && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
            <p className="mb-2 font-bold">Validasi lokal menemukan masalah:</p>
            <ul className="space-y-1">
              {validation.errors.slice(0, 8).map((error) => (
                <li key={error}>- {error}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
              activeTab === tab.id
                ? "bg-[#154212] text-white"
                : "bg-white text-[#154212] shadow-sm hover:bg-[#eef5e8]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </section>

      {activeTab === "overview" && (
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
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
              Konfigurasi Inti
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#154212]">
                  Nama Proyek
                </label>
                <input
                  value={String(workingData._meta.nama_proyek ?? "")}
                  onChange={(event) => updateMeta("nama_proyek", event.target.value)}
                  className="w-full rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28] focus:ring-2 focus:ring-[#BAD36F]/40"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#154212]">
                  Versi Data
                </label>
                <input
                  value={String(workingData._meta.versi ?? "")}
                  onChange={(event) => updateMeta("versi", event.target.value)}
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
                  onChange={(event) => updateThreshold(Number(event.target.value))}
                  className="w-full rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28] focus:ring-2 focus:ring-[#BAD36F]/40"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "gejala" && (
        <section className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#154212]">Kelola Gejala</h2>
              <p className="text-sm text-gray-600">
                Edit label, ID, dan kelompok gejala. Tambahan gejala baru juga
                bisa dilakukan dari sini.
              </p>
            </div>
            <button
              onClick={addGejala}
              className="rounded-2xl bg-[#BAD36F] px-4 py-2.5 text-sm font-bold text-[#154212] transition hover:bg-[#a9c55c]"
            >
              + Tambah Gejala Baru
            </button>
          </div>

          <div className="space-y-4">
            {workingData.gejala.map((gejala, index) => (
              <div
                key={`${gejala.id}-${index}`}
                className="grid grid-cols-1 gap-3 rounded-2xl border border-[#edf2e8] bg-[#fbfcfa] p-4 lg:grid-cols-[0.8fr_2fr_0.8fr]"
              >
                <input
                  value={gejala.id}
                  onChange={(event) => updateGejala(index, "id", event.target.value)}
                  className="rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
                />
                <input
                  value={gejala.label}
                  onChange={(event) => updateGejala(index, "label", event.target.value)}
                  className="rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
                />
                <select
                  value={gejala.kelompok}
                  onChange={(event) =>
                    updateGejala(index, "kelompok", event.target.value)
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
            ))}
          </div>
        </section>
      )}

      {activeTab === "penyakit" && (
        <section className="space-y-5">
          <div className="flex justify-end">
            <button
              onClick={addPenyakit}
              className="rounded-2xl bg-[#BAD36F] px-4 py-2.5 text-sm font-bold text-[#154212] transition hover:bg-[#a9c55c]"
            >
              + Tambah Penyakit/Hama
            </button>
          </div>
          {workingData.penyakit.map((penyakit, index) => (
            <div
              key={`${penyakit.id}-${index}`}
              className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-4">
                <input
                  value={penyakit.id}
                  onChange={(event) =>
                    updatePenyakitField(index, "id", event.target.value)
                  }
                  className="rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
                />
                <input
                  value={penyakit.nama}
                  onChange={(event) =>
                    updatePenyakitField(index, "nama", event.target.value)
                  }
                  className="rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
                />
                <select
                  value={penyakit.jenis}
                  onChange={(event) =>
                    updatePenyakitField(index, "jenis", event.target.value)
                  }
                  className="rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
                >
                  <option value="hama">Hama</option>
                  <option value="penyakit">Penyakit</option>
                </select>
                <input
                  value={penyakit.organisme ?? ""}
                  onChange={(event) =>
                    updatePenyakitField(index, "organisme", event.target.value)
                  }
                  className="rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
                  placeholder="Organisme (opsional)"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl bg-[#f8faf6] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#154212]">
                      Penanganan Jangka Pendek
                    </h3>
                    <button
                      onClick={() => addTreatmentItem(index, "penanganan")}
                      className="text-xs font-bold text-[#154212]"
                    >
                      + Tambah
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(penyakit.solusi?.penanganan ?? []).map((item, itemIndex) => (
                      <textarea
                        key={`${penyakit.id}-penanganan-${itemIndex}`}
                        value={item}
                        onChange={(event) =>
                          updateTreatmentList(
                            index,
                            "penanganan",
                            itemIndex,
                            event.target.value
                          )
                        }
                        className="min-h-20 w-full rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#f8faf6] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#154212]">
                      Pencegahan Jangka Panjang
                    </h3>
                    <button
                      onClick={() => addTreatmentItem(index, "pencegahan")}
                      className="text-xs font-bold text-[#154212]"
                    >
                      + Tambah
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(penyakit.solusi?.pencegahan ?? []).map((item, itemIndex) => (
                      <textarea
                        key={`${penyakit.id}-pencegahan-${itemIndex}`}
                        value={item}
                        onChange={(event) =>
                          updateTreatmentList(
                            index,
                            "pencegahan",
                            itemIndex,
                            event.target.value
                          )
                        }
                        className="min-h-20 w-full rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {activeTab === "cf" && (
        <section className="space-y-6">
          {workingData.penyakit.map((penyakit, penyakitIndex) => (
            <div
              key={`${penyakit.id}-cf`}
              className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-5">
                <h2 className="text-xl font-bold text-[#154212]">
                  {penyakit.id} - {penyakit.nama}
                </h2>
                <p className="text-sm text-gray-600">
                  Edit nilai CF pakar dan keterangan relasi gejala untuk{" "}
                  {penyakit.nama}.
                </p>
              </div>

              <div className="space-y-4">
                {penyakit.aturan.map((rule, ruleIndex) => (
                  <div
                    key={`${penyakit.id}-${rule.gejala_id}`}
                    className="grid grid-cols-1 gap-3 rounded-2xl border border-[#edf2e8] bg-[#fbfcfa] p-4 lg:grid-cols-[1.2fr_0.6fr_1.8fr]"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {rule.gejala_id}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#154212]">
                        {gejalaMap.get(rule.gejala_id) ?? rule.gejala_id}
                      </p>
                    </div>
                    <input
                      type="number"
                      min="-1"
                      max="1"
                      step="0.05"
                      value={rule.cf}
                      onChange={(event) =>
                        updateRule(
                          penyakitIndex,
                          ruleIndex,
                          "cf",
                          event.target.value
                        )
                      }
                      className="rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
                    />
                    <textarea
                      value={rule.ket}
                      onChange={(event) =>
                        updateRule(
                          penyakitIndex,
                          ruleIndex,
                          "ket",
                          event.target.value
                        )
                      }
                      className="min-h-20 rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
