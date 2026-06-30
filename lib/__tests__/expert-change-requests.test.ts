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
});
