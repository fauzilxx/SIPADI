import type { FormEvent } from "react";

import { formatDateLabel } from "@/components/pakar-dashboard/helpers";
import type {
  ChangeRequestEntry,
  ChangeRequestFormState,
  SaveState,
} from "@/components/pakar-dashboard/types";
import type { Gejala, Penyakit } from "@/lib/knowledge-base";

export default function ChangeRequestsTab({
  isAdmin,
  dirty,
  changeRequestState,
  changeRequestLoading,
  visibleChangeRequests,
  changeRequestForm,
  changeRequestNotes,
  changeRequestStatusDraft,
  savingChangeRequest,
  updatingChangeRequestId,
  applyingChangeRequestId,
  onChangeRequestFormChange,
  onChangeRequestNotesChange,
  onChangeRequestStatusDraftChange,
  onSubmitChangeRequest,
  onReviewChangeRequest,
  onApplyChangeRequest,
  penyakitList = [],
  gejalaList = [],
}: {
  isAdmin: boolean;
  dirty: boolean;
  changeRequestState: SaveState;
  changeRequestLoading: boolean;
  visibleChangeRequests: ChangeRequestEntry[];
  changeRequestForm: ChangeRequestFormState;
  changeRequestNotes: Record<string, string>;
  changeRequestStatusDraft: Record<string, ChangeRequestEntry["status"]>;
  savingChangeRequest: boolean;
  updatingChangeRequestId: string | null;
  applyingChangeRequestId: string | null;
  onChangeRequestFormChange: <K extends keyof ChangeRequestFormState>(
    field: K,
    value: ChangeRequestFormState[K]
  ) => void;
  onChangeRequestNotesChange: (requestId: string, value: string) => void;
  onChangeRequestStatusDraftChange: (
    requestId: string,
    value: ChangeRequestEntry["status"]
  ) => void;
  onSubmitChangeRequest: (event: FormEvent<HTMLFormElement>) => void;
  onReviewChangeRequest: (requestId: string) => void;
  onApplyChangeRequest: (requestId: string) => void;
  penyakitList?: Penyakit[];
  gejalaList?: Gejala[];
}) {
  const selectedPenyakit = penyakitList.find(
    (p) => p.id === changeRequestForm.targetPenyakitId
  );
  const selectedGejala = gejalaList.find(
    (g) => g.id === changeRequestForm.targetGejalaId
  );

  const existingRule =
    selectedPenyakit && selectedGejala
      ? selectedPenyakit.aturan.find((r) => r.gejala_id === selectedGejala.id)
      : null;

  const handleCopyCurrentRule = () => {
    if (existingRule) {
      onChangeRequestFormChange("proposedCf", String(existingRule.cf));
      onChangeRequestFormChange("proposedKet", existingRule.ket);
    } else {
      onChangeRequestFormChange("proposedCf", "0");
      onChangeRequestFormChange(
        "proposedKet",
        `Relasi netral antara ${selectedPenyakit?.id || ""} dan ${selectedGejala?.id || ""}.`
      );
    }
  };

  const handleCopyCurrentSolusi = () => {
    if (selectedPenyakit?.solusi?.penanganan) {
      onChangeRequestFormChange(
        "proposedPenanganan",
        selectedPenyakit.solusi.penanganan.join("\n")
      );
    }
  };

  const handleCopyCurrentPencegahan = () => {
    if (selectedPenyakit?.solusi?.pencegahan) {
      onChangeRequestFormChange(
        "proposedPencegahan",
        selectedPenyakit.solusi.pencegahan.join("\n")
      );
    }
  };

  return (
    <section className="space-y-6">
      {changeRequestState.message && (
        <div
          className={`rounded-2xl px-4 py-3 text-sm font-medium ${
            changeRequestState.type === "success"
              ? "border border-green-200 bg-green-50 text-green-700"
              : "border border-red-200 bg-red-50 text-red-600"
          }`}
        >
          {changeRequestState.message}
        </div>
      )}

      {!isAdmin && (
        <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-[#154212]">
            Ajukan Perubahan Non-Gejala
          </h2>
          <p className="mb-5 text-sm leading-relaxed text-gray-600">
            Untuk gejala, gunakan tab Kelola Gejala agar input langsung
            mengikuti format final knowledge base. Form ini dipakai untuk usulan
            aturan CF, solusi, pencegahan, atau catatan umum lain.
          </p>
          <form
            className="grid grid-cols-1 gap-4 lg:grid-cols-2"
            onSubmit={onSubmitChangeRequest}
          >
            <input
              value={changeRequestForm.title}
              onChange={(event) =>
                onChangeRequestFormChange("title", event.target.value)
              }
              placeholder="Judul usulan perubahan"
              className="rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28]"
            />
            <select
              value={changeRequestForm.requestType}
              onChange={(event) =>
                onChangeRequestFormChange(
                  "requestType",
                  event.target.value as ChangeRequestEntry["requestType"]
                )
              }
              className="rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28]"
            >
              <option value="general">Usulan Umum</option>
              <option value="revise_aturan">Revisi Aturan CF</option>
              <option value="revise_solusi">Revisi Solusi</option>
              <option value="revise_pencegahan">Revisi Pencegahan</option>
            </select>
            <select
              value={changeRequestForm.targetPenyakitId}
              onChange={(event) =>
                onChangeRequestFormChange("targetPenyakitId", event.target.value)
              }
              className="rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28] bg-white cursor-pointer"
            >
              <option value="">-- Pilih Target Penyakit/Hama (Opsional) --</option>
              {penyakitList.map((penyakit) => (
                <option key={penyakit.id} value={penyakit.id}>
                  {penyakit.id} - {penyakit.nama}
                </option>
              ))}
            </select>
            <select
              value={changeRequestForm.targetGejalaId}
              onChange={(event) =>
                onChangeRequestFormChange("targetGejalaId", event.target.value)
              }
              className="rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28] bg-white cursor-pointer"
            >
              <option value="">-- Pilih Target Gejala (Opsional) --</option>
              {gejalaList.map((gejala) => (
                <option key={gejala.id} value={gejala.id}>
                  {gejala.id} - {gejala.label.length > 70 ? `${gejala.label.substring(0, 70)}...` : gejala.label}
                </option>
              ))}
            </select>

            {(selectedPenyakit || selectedGejala) && (
              <div className="lg:col-span-2 rounded-2xl border border-[#d9e5d1] bg-[#fcfdfa] p-5 space-y-4 shadow-sm">
                <h4 className="text-sm font-bold text-[#154212] flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#7a9a28] animate-pulse" />
                  Informasi Knowledge Base Saat Ini
                </h4>

                {changeRequestForm.requestType === "revise_aturan" && (
                  <div className="text-sm space-y-3">
                    <p className="text-gray-600">
                      Menghubungkan penyakit/hama <strong className="text-[#154212]">{selectedPenyakit?.nama || "(Pilih Penyakit)"}</strong> dengan gejala <strong className="text-[#154212]">{selectedGejala?.label || "(Pilih Gejala)"}</strong>.
                    </p>
                    {selectedPenyakit && selectedGejala ? (
                      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-2">
                        <div className="flex justify-between items-center text-xs text-gray-500 border-b border-gray-50 pb-2">
                          <span>ATURAN AKTIF</span>
                          <span className="font-mono">{selectedPenyakit.id} &larr; {selectedGejala.id}</span>
                        </div>
                        {existingRule ? (
                          <div className="space-y-1">
                            <p className="text-sm text-gray-700">
                              Nilai CF: <strong className="text-[#154212]">{existingRule.cf}</strong> (Skala -1.0 s.d 1.0)
                            </p>
                            <p className="text-sm text-gray-700">
                              Keterangan: <span className="italic text-gray-600">"{existingRule.ket}"</span>
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-amber-600 italic">
                            Belum ada aturan relasi untuk kombinasi ini di knowledge base (nilai CF default = 0).
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={handleCopyCurrentRule}
                          className="mt-2 w-full sm:w-auto rounded-xl border border-[#154212] px-3.5 py-1.5 text-xs font-bold text-[#154212] transition hover:bg-[#eef5e8] cursor-pointer"
                        >
                          {existingRule ? "Salin CF & Keterangan Saat Ini ke Form" : "Gunakan Nilai Default (CF 0) ke Form"}
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic">
                        Pilih kedua target penyakit/hama dan target gejala untuk melihat relasi CF saat ini.
                      </p>
                    )}
                  </div>
                )}

                {changeRequestForm.requestType === "revise_solusi" && (
                  <div className="text-sm space-y-3">
                    <p className="text-gray-600">
                      Penanganan (Solusi) untuk <strong className="text-[#154212]">{selectedPenyakit?.nama || "(Pilih Penyakit)"}</strong>:
                    </p>
                    {selectedPenyakit ? (
                      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
                        {selectedPenyakit.solusi?.penanganan && selectedPenyakit.solusi.penanganan.length > 0 && selectedPenyakit.solusi.penanganan[0] !== "" ? (
                          <ol className="list-decimal pl-5 space-y-1 text-xs text-gray-700">
                            {selectedPenyakit.solusi.penanganan.map((p, idx) => (
                              <li key={idx}>{p}</li>
                            ))}
                          </ol>
                        ) : (
                          <p className="text-xs text-amber-600 italic">Belum ada data penanganan.</p>
                        )}
                        {selectedPenyakit.solusi?.penanganan && (
                          <button
                            type="button"
                            onClick={handleCopyCurrentSolusi}
                            className="w-full sm:w-auto rounded-xl border border-[#154212] px-3.5 py-1.5 text-xs font-bold text-[#154212] transition hover:bg-[#eef5e8] cursor-pointer"
                          >
                            Salin Penanganan Saat Ini ke Form
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic">Pilih target penyakit/hama untuk melihat solusi penanganan.</p>
                    )}
                  </div>
                )}

                {changeRequestForm.requestType === "revise_pencegahan" && (
                  <div className="text-sm space-y-3">
                    <p className="text-gray-600">
                      Pencegahan untuk <strong className="text-[#154212]">{selectedPenyakit?.nama || "(Pilih Penyakit)"}</strong>:
                    </p>
                    {selectedPenyakit ? (
                      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
                        {selectedPenyakit.solusi?.pencegahan && selectedPenyakit.solusi.pencegahan.length > 0 && selectedPenyakit.solusi.pencegahan[0] !== "" ? (
                          <ol className="list-decimal pl-5 space-y-1 text-xs text-gray-700">
                            {selectedPenyakit.solusi.pencegahan.map((p, idx) => (
                              <li key={idx}>{p}</li>
                            ))}
                          </ol>
                        ) : (
                          <p className="text-xs text-amber-600 italic">Belum ada data pencegahan.</p>
                        )}
                        {selectedPenyakit.solusi?.pencegahan && (
                          <button
                            type="button"
                            onClick={handleCopyCurrentPencegahan}
                            className="w-full sm:w-auto rounded-xl border border-[#154212] px-3.5 py-1.5 text-xs font-bold text-[#154212] transition hover:bg-[#eef5e8] cursor-pointer"
                          >
                            Salin Pencegahan Saat Ini ke Form
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic">Pilih target penyakit/hama untuk melihat pencegahan.</p>
                    )}
                  </div>
                )}

                {changeRequestForm.requestType === "general" && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs text-gray-700">
                    {selectedPenyakit && (
                      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <p className="font-bold text-[#154212] mb-1">Target Penyakit/Hama Terpilih</p>
                        <p>ID: {selectedPenyakit.id}</p>
                        <p>Nama: {selectedPenyakit.nama}</p>
                        <p className="capitalize">Jenis: {selectedPenyakit.jenis}</p>
                        {selectedPenyakit.organisme && <p>Organisme: {selectedPenyakit.organisme}</p>}
                      </div>
                    )}
                    {selectedGejala && (
                      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <p className="font-bold text-[#154212] mb-1">Target Gejala Terpilih</p>
                        <p>ID: {selectedGejala.id}</p>
                        <p className="font-semibold">Label: {selectedGejala.label}</p>
                        <p>Kelompok: {selectedGejala.kelompok}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {changeRequestForm.requestType === "revise_aturan" && (
              <>
                <input
                  type="number"
                  min="-1"
                  max="1"
                  step="0.05"
                  value={changeRequestForm.proposedCf}
                  onChange={(event) =>
                    onChangeRequestFormChange("proposedCf", event.target.value)
                  }
                  placeholder="Nilai CF usulan"
                  className="rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28]"
                />
                <input
                  value={changeRequestForm.proposedKet}
                  onChange={(event) =>
                    onChangeRequestFormChange("proposedKet", event.target.value)
                  }
                  placeholder="Keterangan aturan baru"
                  className="rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28]"
                />
              </>
            )}

            {changeRequestForm.requestType === "revise_solusi" && (
              <textarea
                value={changeRequestForm.proposedPenanganan}
                onChange={(event) =>
                  onChangeRequestFormChange(
                    "proposedPenanganan",
                    event.target.value
                  )
                }
                placeholder="Tulis butir penanganan baru, satu baris satu poin"
                className="min-h-32 rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28] lg:col-span-2"
              />
            )}

            {changeRequestForm.requestType === "revise_pencegahan" && (
              <textarea
                value={changeRequestForm.proposedPencegahan}
                onChange={(event) =>
                  onChangeRequestFormChange(
                    "proposedPencegahan",
                    event.target.value
                  )
                }
                placeholder="Tulis butir pencegahan baru, satu baris satu poin"
                className="min-h-32 rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28] lg:col-span-2"
              />
            )}

            <textarea
              value={changeRequestForm.description}
              onChange={(event) =>
                onChangeRequestFormChange("description", event.target.value)
              }
              placeholder="Alasan atau konteks usulan"
              className="min-h-28 rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28] lg:col-span-2"
            />
            <textarea
              value={changeRequestForm.proposedChange}
              onChange={(event) =>
                onChangeRequestFormChange("proposedChange", event.target.value)
              }
              placeholder="Tuliskan rincian perubahan yang diajukan"
              className="min-h-32 rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28] lg:col-span-2"
            />
            <div className="lg:col-span-2">
              <button
                type="submit"
                disabled={savingChangeRequest}
                className="rounded-2xl bg-[#154212] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12370f] disabled:opacity-60"
              >
                {savingChangeRequest ? "Menyimpan..." : "Simpan Usulan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {changeRequestLoading ? (
        <StateCard message="Sedang memuat usulan perubahan pakar..." />
      ) : visibleChangeRequests.length === 0 ? (
        <StateCard message="Belum ada usulan perubahan yang masuk." />
      ) : (
        <div className="space-y-5">
          {visibleChangeRequests.map((request) => (
            <div
              key={request.id}
              className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#eef5e8] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#154212]">
                      {request.requestType.replaceAll("_", " ")}
                    </span>
                    <span className="rounded-full bg-[#f3f5ef] px-3 py-1 text-xs font-semibold text-[#4d5c47]">
                      Pengusul: {request.submittedByUsername}
                    </span>
                    {request.targetPenyakitId && (
                      <span className="rounded-full bg-[#f8faf6] px-3 py-1 text-xs font-semibold text-[#154212]">
                        {request.targetPenyakitId}
                      </span>
                    )}
                    {request.targetGejalaId && (
                      <span className="rounded-full bg-[#f8faf6] px-3 py-1 text-xs font-semibold text-[#154212]">
                        {request.targetGejalaId}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-[#154212]">
                    {request.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Diajukan {formatDateLabel(request.submittedAt)} oleh{" "}
                    {request.submittedByRole}.
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f8faf6] px-4 py-3 text-sm text-[#154212]">
                  Status: <strong className="capitalize">{request.status}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
                <div className="space-y-4">
                  <div className="rounded-2xl bg-[#f8faf6] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Latar Belakang
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-700">
                      {request.description}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#f8faf6] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Perubahan yang Diajukan
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-700">
                      {request.proposedChange}
                    </p>
                  </div>

                  {request.structuredPayload?.type === "upsert_gejala" && (
                    <GejalaRequestPreview request={request} />
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#154212]">
                      {isAdmin ? "Status Review" : "Status Saat Ini"}
                    </label>
                    {isAdmin && request.status !== "applied" ? (
                      <select
                        value={changeRequestStatusDraft[request.id] ?? request.status}
                        onChange={(event) =>
                          onChangeRequestStatusDraftChange(
                            request.id,
                            event.target.value as ChangeRequestEntry["status"]
                          )
                        }
                        className="w-full rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28]"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    ) : (
                      <div className="rounded-2xl border border-[#d9e5d1] bg-[#f8faf6] px-4 py-3 text-sm text-[#154212]">
                        {request.status}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#154212]">
                      {isAdmin ? "Catatan Reviewer" : "Catatan Admin"}
                    </label>
                    {isAdmin ? (
                      <textarea
                        value={changeRequestNotes[request.id] ?? ""}
                        onChange={(event) =>
                          onChangeRequestNotesChange(request.id, event.target.value)
                        }
                        rows={4}
                        className="min-h-24 w-full rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28]"
                      />
                    ) : (
                      <div className="min-h-24 rounded-2xl border border-[#d9e5d1] bg-[#f8faf6] px-4 py-3 text-sm text-gray-700">
                        {request.reviewerNotes ||
                          "Belum ada catatan review dari admin."}
                      </div>
                    )}
                  </div>

                  {request.applicationSummary && (
                    <div className="rounded-2xl border border-[#d9e5d1] bg-[#f8faf6] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Ringkasan Penerapan
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-gray-700">
                        {request.applicationSummary}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1 text-xs text-gray-500">
                      <p>Terakhir diubah: {formatDateLabel(request.updatedAt)}</p>
                      <p>
                        Direview:{" "}
                        {request.reviewedByUsername
                          ? `${request.reviewedByUsername} (${formatDateLabel(
                              request.reviewedAt
                            )})`
                          : "-"}
                      </p>
                      <p>
                        Diterapkan:{" "}
                        {request.appliedByUsername
                          ? `${request.appliedByUsername} (${formatDateLabel(
                              request.appliedAt
                            )})`
                          : "-"}
                      </p>
                    </div>
                    {isAdmin && (
                      <div className="flex flex-wrap justify-end gap-3">
                        <button
                          onClick={() => onReviewChangeRequest(request.id)}
                          disabled={updatingChangeRequestId === request.id}
                          className="rounded-2xl bg-[#154212] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#12370f] disabled:opacity-60"
                        >
                          {updatingChangeRequestId === request.id
                            ? "Menyimpan..."
                            : "Simpan Review"}
                        </button>
                        <button
                          onClick={() => onApplyChangeRequest(request.id)}
                          disabled={
                            applyingChangeRequestId === request.id ||
                            request.status !== "approved" ||
                            !request.structuredPayload ||
                            dirty
                          }
                          className="rounded-2xl border border-[#154212] px-4 py-2.5 text-sm font-bold text-[#154212] transition hover:bg-[#f0f4ec] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {applyingChangeRequestId === request.id
                            ? "Menerapkan..."
                            : "Terapkan ke KB"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function GejalaRequestPreview({ request }: { request: ChangeRequestEntry }) {
  if (request.structuredPayload?.type !== "upsert_gejala") {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[#d9e5d1] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Preview Data Final
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <PreviewCell label="ID" value={request.structuredPayload.gejala.id} />
        <PreviewCell
          label="Label Baru"
          value={request.structuredPayload.gejala.label}
          spanTwo
        />
        <PreviewCell
          label="Kelompok Baru"
          value={request.structuredPayload.gejala.kelompok}
        />
        <PreviewCell
          label="Mode"
          value={request.structuredPayload.mode}
          spanTwo
          capitalize
        />
      </div>

      {request.structuredPayload.previousValue ? (
        <div className="mt-4 rounded-2xl border border-dashed border-[#d9e5d1] bg-[#fcfdfa] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Diff
          </p>
          <div className="mt-2 space-y-2 text-sm text-gray-700">
            <p>
              Label:{" "}
              <span className="font-semibold text-gray-500">
                {request.structuredPayload.previousValue.label}
              </span>{" "}
              -&gt;{" "}
              <span className="font-semibold text-[#154212]">
                {request.structuredPayload.gejala.label}
              </span>
            </p>
            <p>
              Kelompok:{" "}
              <span className="font-semibold text-gray-500">
                {request.structuredPayload.previousValue.kelompok}
              </span>{" "}
              -&gt;{" "}
              <span className="font-semibold text-[#154212]">
                {request.structuredPayload.gejala.kelompok}
              </span>
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-dashed border-[#d9e5d1] bg-[#fcfdfa] px-4 py-3 text-sm font-semibold text-[#154212]">
            Gejala baru akan ditambahkan ke knowledge base bila admin menyetujui
            usulan ini.
          </div>
          {request.structuredPayload.relationRules?.length ? (
            <div className="rounded-2xl border border-[#d9e5d1] bg-[#fcfdfa] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Relasi Penyakit/Hama
              </p>
              <div className="mt-3 space-y-3">
                {request.structuredPayload.relationRules.map((relationRule) => (
                  <div
                    key={`${request.id}-${relationRule.penyakitId}`}
                    className="grid grid-cols-1 gap-3 rounded-2xl bg-white px-4 py-3 sm:grid-cols-[0.9fr_0.4fr_1.5fr]"
                  >
                    <PreviewCell
                      label="Penyakit/Hama"
                      value={relationRule.penyakitId}
                    />
                    <PreviewCell label="CF" value={String(relationRule.cf)} />
                    <PreviewCell
                      label="Keterangan"
                      value={relationRule.ket || "Otomatis default sistem"}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function PreviewCell({
  label,
  value,
  spanTwo = false,
  capitalize = false,
}: {
  label: string;
  value: string;
  spanTwo?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className={`rounded-2xl bg-[#f8faf6] px-4 py-3 ${spanTwo ? "sm:col-span-2" : ""}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-bold text-[#154212] ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function StateCard({ message }: { message: string }) {
  return (
    <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
