import { describe, expect, it } from "vitest";

import type { KnowledgeBaseData } from "@/lib/knowledge-base";
import {
  applyChangeRequestToKnowledgeBaseData,
  validateExpertChangeRequest,
  validateExpertChangeRequestApply,
  validateExpertChangeRequestReview,
  type ExpertChangeRequestEntry,
} from "@/lib/expert-change-requests";

const baseKnowledgeBase: KnowledgeBaseData = {
  _meta: {
    nama_proyek: "Test SIPADI",
    versi: "1.0.0",
  },
  gejala: [
    {
      id: "G01",
      label: "Gejala 1",
      kelompok: "A",
    },
    {
      id: "G02",
      label: "Gejala 2",
      kelompok: "B",
    },
  ],
  penyakit: [
    {
      id: "P01",
      nama: "Penyakit 1",
      jenis: "penyakit",
      aturan: [
        {
          gejala_id: "G01",
          cf: 0.8,
          ket: "Aturan awal",
        },
      ],
      solusi: {
        penanganan: ["Penanganan awal"],
        pencegahan: ["Pencegahan awal"],
      },
    },
    {
      id: "P02",
      nama: "Penyakit 2",
      jenis: "penyakit",
      aturan: [
        {
          gejala_id: "G02",
          cf: 0.8,
          ket: "Aturan awal P02",
        },
      ],
      solusi: {
        penanganan: ["Penanganan P02"],
        pencegahan: ["Pencegahan P02"],
      },
    },
  ],
  cf_formula: {
    threshold_tampil: 0.3,
  },
};

function createApprovedRequest(
  overrides: Partial<ExpertChangeRequestEntry>
): ExpertChangeRequestEntry {
  return {
    id: "CRQ-1",
    submittedAt: "2026-06-30T00:00:00.000Z",
    updatedAt: "2026-06-30T00:00:00.000Z",
    reviewedAt: "2026-06-30T01:00:00.000Z",
    appliedAt: null,
    status: "approved",
    title: "Usulan terstruktur",
    requestType: "general",
    targetPenyakitId: "",
    targetGejalaId: "",
    description: "Latar belakang usulan",
    proposedChange: "Rangkuman usulan",
    reviewerNotes: "Layak diterapkan",
    applicationSummary: "",
    submittedByUsername: "pakar",
    submittedByRole: "pakar",
    reviewedByUsername: "admin",
    appliedByUsername: null,
    structuredPayload: null,
    ...overrides,
  };
}

describe("expert change requests", () => {
  it("memvalidasi usulan perubahan terstruktur yang lengkap", () => {
    const validated = validateExpertChangeRequest({
      title: "Revisi aturan penggerek batang",
      requestType: "revise_aturan",
      targetPenyakitId: "P02",
      targetGejalaId: "G09",
      description: "Ada koreksi nilai CF dari hasil evaluasi pakar.",
      proposedChange: "Naikkan CF gejala G09 dari 0.9 menjadi 0.95.",
      structuredPayload: {
        penyakitId: "P02",
        gejalaId: "G09",
        cf: 0.95,
        ket: "Nilai baru hasil evaluasi lapang.",
      },
    });

    expect(validated.errors).toEqual([]);
    expect(validated.data?.structuredPayload?.type).toBe("revise_aturan");
  });

  it("memvalidasi usulan gejala final-format untuk create", () => {
    const validated = validateExpertChangeRequest({
      title: "Tambah gejala baru",
      requestType: "upsert_gejala",
      description: "Pakar menambahkan gejala baru dari hasil evaluasi lapang.",
      proposedChange: 'Tambahkan gejala G03 dengan label "Gejala baru".',
      structuredPayload: {
        mode: "create",
        gejala: {
          id: "G03",
          label: "Gejala baru",
          kelompok: "C",
        },
        relationRules: [
          {
            penyakitId: "P01",
            cf: 0.7,
            ket: "Gejala baru cukup kuat mendukung penyakit.",
          },
          {
            penyakitId: "P02",
            cf: -0.2,
            ket: "Gejala ini cenderung tidak mendukung P02.",
          },
        ],
      },
    });

    expect(validated.errors).toEqual([]);
    expect(validated.data?.structuredPayload?.type).toBe("upsert_gejala");
  });

  it("menolak usulan terstruktur yang tidak lengkap", () => {
    const validated = validateExpertChangeRequest({
      title: "Tambah gejala",
      requestType: "add_gejala",
      description: "Gejala baru perlu ditambahkan.",
      proposedChange: "Tambah gejala baru.",
      structuredPayload: {
        gejalaId: "",
        gejalaLabel: "",
        kelompok: "Z",
      },
    });

    expect(validated.data).toBeNull();
    expect(validated.errors.length).toBeGreaterThan(0);
  });

  it("menolak usulan gejala update jika mode atau field inti tidak valid", () => {
    const validated = validateExpertChangeRequest({
      title: "Revisi gejala",
      requestType: "upsert_gejala",
      description: "Percobaan payload invalid.",
      proposedChange: "Payload invalid.",
      structuredPayload: {
        mode: "rename",
        gejala: {
          id: "",
          label: "",
          kelompok: "Z",
        },
      },
    });

    expect(validated.data).toBeNull();
    expect(validated.errors.length).toBeGreaterThan(0);
  });

  it("menolak usulan gejala baru jika relasi penyakit belum dikirim", () => {
    const validated = validateExpertChangeRequest({
      title: "Tambah gejala baru",
      requestType: "upsert_gejala",
      description: "Gejala baru tanpa relasi awal.",
      proposedChange: "Tambah gejala tanpa relasi.",
      structuredPayload: {
        mode: "create",
        gejala: {
          id: "G03",
          label: "Gejala baru",
          kelompok: "C",
        },
        relationRules: [],
      },
    });

    expect(validated.data).toBeNull();
    expect(
      validated.errors.some((error) => error.includes("Minimal satu data relasi"))
    ).toBe(true);
  });

  it("memvalidasi perubahan status review usulan", () => {
    const validated = validateExpertChangeRequestReview({
      id: "CRQ-1",
      status: "approved",
      reviewerNotes: "Layak ditindaklanjuti.",
    });

    expect(validated.errors).toEqual([]);
    expect(validated.data?.status).toBe("approved");
  });

  it("memvalidasi payload apply usulan", () => {
    const validated = validateExpertChangeRequestApply({
      id: "CRQ-1",
    });

    expect(validated.errors).toEqual([]);
    expect(validated.data?.id).toBe("CRQ-1");
  });

  it("menerapkan usulan tambah gejala ke knowledge base", () => {
    const result = applyChangeRequestToKnowledgeBaseData(
      structuredClone(baseKnowledgeBase),
      createApprovedRequest({
        requestType: "add_gejala",
        targetGejalaId: "G03",
        structuredPayload: {
          type: "add_gejala",
          gejalaId: "G03",
          gejalaLabel: "Gejala baru dari pakar",
          kelompok: "C",
        },
      })
    );

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.gejala.some((item) => item.id === "G03")).toBe(true);
    expect(result.applicationSummary).toContain("Menambahkan gejala G03");
  });

  it("menerapkan usulan upsert gejala create ke knowledge base", () => {
    const result = applyChangeRequestToKnowledgeBaseData(
      structuredClone(baseKnowledgeBase),
      createApprovedRequest({
        requestType: "upsert_gejala",
        targetPenyakitId: "P01",
        targetGejalaId: "G03",
        structuredPayload: {
          type: "upsert_gejala",
          mode: "create",
          gejala: {
            id: "G03",
            label: "Gejala baru final format",
            kelompok: "C",
          },
          relationRules: [
            {
              penyakitId: "P01",
              cf: 0.75,
              ket: "Relasi awal dari gejala baru.",
            },
          ],
          previousValue: null,
        },
      })
    );

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(
      result.data.gejala.some(
        (item) =>
          item.id === "G03" &&
          item.label === "Gejala baru final format" &&
          item.kelompok === "C"
      )
    ).toBe(true);
    expect(
      result.data.penyakit[0]?.aturan.some(
        (rule) =>
          rule.gejala_id === "G03" &&
          rule.cf === 0.75 &&
          rule.ket === "Relasi awal dari gejala baru."
      )
    ).toBe(true);
    expect(
      result.data.penyakit[1]?.aturan.some(
        (rule) =>
          rule.gejala_id === "G03" &&
          rule.cf === 0 &&
          rule.ket.includes("Belum ada pengaruh langsung")
      )
    ).toBe(true);
    expect(result.normalizedRequest?.targetGejalaId).toBe("G03");
  });

  it("menerapkan usulan upsert gejala update ke knowledge base", () => {
    const result = applyChangeRequestToKnowledgeBaseData(
      structuredClone(baseKnowledgeBase),
      createApprovedRequest({
        requestType: "upsert_gejala",
        targetGejalaId: "G01",
        structuredPayload: {
          type: "upsert_gejala",
          mode: "update",
          gejala: {
            id: "G01",
            label: "Gejala 1 revisi",
            kelompok: "C",
          },
          previousValue: {
            id: "G01",
            label: "Gejala 1",
            kelompok: "A",
          },
        },
      })
    );

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.gejala.find((item) => item.id === "G01")).toEqual({
      id: "G01",
      label: "Gejala 1 revisi",
      kelompok: "C",
    });
  });

  it("menerapkan revisi aturan dan menambah rule jika belum ada", () => {
    const result = applyChangeRequestToKnowledgeBaseData(
      structuredClone(baseKnowledgeBase),
      createApprovedRequest({
        requestType: "revise_aturan",
        targetPenyakitId: "P01",
        targetGejalaId: "G02",
        structuredPayload: {
          type: "revise_aturan",
          penyakitId: "P01",
          gejalaId: "G02",
          cf: 0.8,
          ket: "Gejala kedua kini ikut mendukung.",
        },
      })
    );

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    const aturanBaru = result.data.penyakit[0]?.aturan.find(
      (item) => item.gejala_id === "G02"
    );
    expect(aturanBaru?.cf).toBe(0.8);
    expect(aturanBaru?.ket).toBe("Gejala kedua kini ikut mendukung.");
  });

  it("memperbarui butir solusi penanganan secara terstruktur", () => {
    const result = applyChangeRequestToKnowledgeBaseData(
      structuredClone(baseKnowledgeBase),
      createApprovedRequest({
        requestType: "revise_solusi",
        targetPenyakitId: "P01",
        structuredPayload: {
          type: "revise_solusi",
          penyakitId: "P01",
          penanganan: ["Butir baru 1", "Butir baru 2"],
        },
      })
    );

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.penyakit[0]?.solusi?.penanganan).toEqual([
      "Butir baru 1",
      "Butir baru 2",
    ]);
    expect(result.data.penyakit[0]?.solusi?.pencegahan).toEqual([
      "Pencegahan awal",
    ]);
  });

  it("menolak apply bila status usulan belum approved", () => {
    const result = applyChangeRequestToKnowledgeBaseData(
      structuredClone(baseKnowledgeBase),
      createApprovedRequest({
        status: "pending",
        requestType: "add_gejala",
        structuredPayload: {
          type: "add_gejala",
          gejalaId: "G03",
          gejalaLabel: "Gejala baru dari pakar",
          kelompok: "C",
        },
      })
    );

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.errors).toContain(
      "Hanya usulan berstatus approved yang dapat diterapkan."
    );
  });

  it("menolak apply revisi aturan jika membuat penyakit kehilangan gejala kuat", () => {
    const result = applyChangeRequestToKnowledgeBaseData(
      structuredClone(baseKnowledgeBase),
      createApprovedRequest({
        requestType: "revise_aturan",
        targetPenyakitId: "P01",
        targetGejalaId: "G01",
        structuredPayload: {
          type: "revise_aturan",
          penyakitId: "P01",
          gejalaId: "G01",
          cf: 0.4,
          ket: "Diturunkan terlalu rendah.",
        },
      })
    );

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(
      result.errors.some((error) => error.includes("tidak lagi memiliki gejala kuat"))
    ).toBe(true);
  });

  it("menolak apply tambah gejala dengan label yang terlalu mirip", () => {
    const result = applyChangeRequestToKnowledgeBaseData(
      structuredClone(baseKnowledgeBase),
      createApprovedRequest({
        requestType: "add_gejala",
        targetGejalaId: "G03",
        structuredPayload: {
          type: "add_gejala",
          gejalaId: "G03",
          gejalaLabel: "gejala 1",
          kelompok: "C",
        },
      })
    );

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(
      result.errors.some((error) => error.includes("duplikat atau terlalu mirip"))
    ).toBe(true);
  });

  it("mengalokasikan ulang ID upsert gejala create jika ID usulan sudah dipakai", () => {
    const result = applyChangeRequestToKnowledgeBaseData(
      structuredClone(baseKnowledgeBase),
      createApprovedRequest({
        requestType: "upsert_gejala",
        targetPenyakitId: "P01",
        targetGejalaId: "G01",
        structuredPayload: {
          type: "upsert_gejala",
          mode: "create",
          gejala: {
            id: "G01",
            label: "Gejala baru bentrok ID",
            kelompok: "B",
          },
          relationRules: [
            {
              penyakitId: "P01",
              cf: 0.7,
              ket: "Relasi bentrok ID.",
            },
          ],
          previousValue: null,
        },
      })
    );

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(
      result.data.gejala.some(
        (item) => item.id === "G03" && item.label === "Gejala baru bentrok ID"
      )
    ).toBe(true);
    expect(
      result.data.penyakit[0]?.aturan.some(
        (rule) => rule.gejala_id === "G03" && rule.cf === 0.7
      )
    ).toBe(true);
    expect(result.applicationSummary).toContain("Menambahkan gejala G03");
    expect(result.normalizedRequest?.targetGejalaId).toBe("G03");
    expect(
      result.normalizedRequest?.structuredPayload?.type === "upsert_gejala"
        ? result.normalizedRequest.structuredPayload.gejala.id
        : null
    ).toBe("G03");
  });

  it("menolak apply upsert gejala update jika target tidak ada", () => {
    const result = applyChangeRequestToKnowledgeBaseData(
      structuredClone(baseKnowledgeBase),
      createApprovedRequest({
        requestType: "upsert_gejala",
        targetGejalaId: "G99",
        structuredPayload: {
          type: "upsert_gejala",
          mode: "update",
          gejala: {
            id: "G99",
            label: "Gejala hilang",
            kelompok: "B",
          },
          previousValue: null,
        },
      })
    );

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(
      result.errors.some((error) => error.includes("tidak ditemukan di knowledge base"))
    ).toBe(true);
  });

  it("menolak apply upsert gejala create jika target penyakit tidak ada", () => {
    const result = applyChangeRequestToKnowledgeBaseData(
      structuredClone(baseKnowledgeBase),
      createApprovedRequest({
        requestType: "upsert_gejala",
        targetPenyakitId: "P99",
        targetGejalaId: "G03",
        structuredPayload: {
          type: "upsert_gejala",
          mode: "create",
          gejala: {
            id: "G03",
            label: "Gejala baru",
            kelompok: "C",
          },
          relationRules: [
            {
              penyakitId: "P99",
              cf: 0.7,
              ket: "Target penyakit tidak ada.",
            },
          ],
          previousValue: null,
        },
      })
    );

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(
      result.errors.some((error) => error.includes("Target penyakit/hama P99"))
    ).toBe(true);
  });
});
