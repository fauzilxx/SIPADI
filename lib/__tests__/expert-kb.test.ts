import { access, mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  prepareKnowledgeBaseDataForSave,
  type SaveKnowledgeBaseFileOptions,
  writeTextFileAtomically,
} from "@/lib/expert-kb";
import {
  validateKnowledgeBaseData,
  type KnowledgeBaseData,
} from "@/lib/knowledge-base";
import type {
  MarketplaceProduct,
  NonChemicalControlItem,
  RecommendationEntry,
} from "@/lib/supplemental-content";

const baseKnowledgeBase: KnowledgeBaseData = {
  _meta: {
    nama_proyek: "Test SIPADI",
    versi: "1.0.0",
    revision: 2,
    updatedAt: "2026-06-30T00:00:00.000Z",
    updatedBy: "admin-lama",
  },
  gejala: [
    {
      id: "G01",
      label: "Gejala 1",
      kelompok: "A",
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

const alignedSupplementalBundle: {
  rekomendasi: RecommendationEntry[];
  marketplaceProducts: MarketplaceProduct[];
  nonChemicalControls: NonChemicalControlItem[];
} = {
  rekomendasi: [
    {
      penyakit_id: "P01",
      nama: "Penyakit 1",
      productIds: {
        marketplace: [],
        nonKimia: [],
      },
      solusi: {
        kimia: ["Solusi kimia"],
        mekanis: [],
        biologis: [],
      },
      pencegahan_jangka_pendek: ["Pencegahan cepat"],
      pencegahan_jangka_panjang: [],
      sumber: [],
    },
  ],
  marketplaceProducts: [],
  nonChemicalControls: [],
};

function prepare(
  input: KnowledgeBaseData,
  options?: SaveKnowledgeBaseFileOptions,
  supplementalBundle?: {
    rekomendasi: RecommendationEntry[];
    marketplaceProducts: MarketplaceProduct[];
    nonChemicalControls: NonChemicalControlItem[];
  }
) {
  return prepareKnowledgeBaseDataForSave(
    structuredClone(baseKnowledgeBase),
    structuredClone(input),
    options,
    supplementalBundle ?? alignedSupplementalBundle
  );
}

describe("prepareKnowledgeBaseDataForSave", () => {
  it("menaikkan revision dan metadata audit saat save valid", () => {
    const result = prepare(baseKnowledgeBase, {
      expectedRevision: 2,
      updatedByUsername: "admin-baru",
      nowIso: "2026-06-30T12:00:00.000Z",
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data._meta.revision).toBe(3);
    expect(result.data._meta.updatedAt).toBe("2026-06-30T12:00:00.000Z");
    expect(result.data._meta.updatedBy).toBe("admin-baru");
  });

  it("menolak save jika revision dari client sudah stale", () => {
    const result = prepare(baseKnowledgeBase, {
      expectedRevision: 1,
      updatedByUsername: "admin-baru",
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.code).toBe("conflict");
    expect(result.currentRevision).toBe(2);
  });

  it("tetap bisa menormalkan data lama yang belum punya revision", () => {
    const legacyCurrentData: KnowledgeBaseData = {
      ...structuredClone(baseKnowledgeBase),
      _meta: {
        nama_proyek: "Legacy SIPADI",
        versi: "0.9.0",
      },
    };
    const result = prepareKnowledgeBaseDataForSave(
      legacyCurrentData,
      legacyCurrentData,
      {
        expectedRevision: 0,
        updatedByUsername: "admin-legacy",
        nowIso: "2026-06-30T13:00:00.000Z",
      },
      alignedSupplementalBundle
    );

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data._meta.revision).toBe(1);
    expect(result.data._meta.updatedBy).toBe("admin-legacy");
  });

  it("mengelompokkan error lintas-file saat KB tidak sinkron dengan supplemental content", () => {
    const result = prepare(
      baseKnowledgeBase,
      {
        expectedRevision: 2,
        updatedByUsername: "admin-baru",
      },
      {
        rekomendasi: [],
        marketplaceProducts: [],
        nonChemicalControls: [],
      }
    );

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.code).toBe("validation");
    expect(result.errorCategories?.supplementalSync.length).toBeGreaterThan(0);
    expect(result.errorCategories?.displayReadiness).toEqual([]);
  });
});

describe("validateKnowledgeBaseData business rules", () => {
  it("menolak label gejala yang duplikat atau terlalu mirip", () => {
    const candidate: KnowledgeBaseData = {
      ...structuredClone(baseKnowledgeBase),
      gejala: [
        ...structuredClone(baseKnowledgeBase.gejala),
        {
          id: "G02",
          label: "gejala-1",
          kelompok: "B",
        },
      ],
      penyakit: [
        {
          ...structuredClone(baseKnowledgeBase.penyakit[0]!),
          aturan: [
            ...structuredClone(baseKnowledgeBase.penyakit[0]!.aturan),
            {
              gejala_id: "G02",
              cf: 0.8,
              ket: "Aturan tambahan",
            },
          ],
        },
      ],
    };

    const result = validateKnowledgeBaseData(candidate);

    expect(result.data).toBeNull();
    expect(result.errors.some((error) => error.includes("Label gejala duplikat"))).toBe(
      true
    );
  });

  it("menolak penyakit yang tidak punya gejala kuat", () => {
    const candidate: KnowledgeBaseData = {
      ...structuredClone(baseKnowledgeBase),
      penyakit: [
        {
          ...structuredClone(baseKnowledgeBase.penyakit[0]!),
          aturan: [
            {
              gejala_id: "G01",
              cf: 0.6,
              ket: "Tidak cukup kuat",
            },
          ],
        },
      ],
    };

    const result = validateKnowledgeBaseData(candidate);

    expect(result.data).toBeNull();
    expect(
      result.errors.some((error) => error.includes("minimal satu gejala kuat"))
    ).toBe(true);
  });
});

describe("writeTextFileAtomically", () => {
  it("menulis file target secara utuh lewat file sementara", async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "sipadi-kb-"));
    const targetPath = path.join(tempDirectory, "knowledge-base.json");

    await writeTextFileAtomically(targetPath, '{"ok":true}\n');

    await expect(readFile(targetPath, "utf8")).resolves.toBe('{"ok":true}\n');
  });

  it("membersihkan file sementara jika rename gagal", async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "sipadi-kb-"));
    const tempFilePath = path.join(tempDirectory, "orphan.tmp");
    const targetPath = tempDirectory;

    await expect(
      writeTextFileAtomically(targetPath, '{"ok":false}\n', {
        tempFilePath,
      })
    ).rejects.toThrow();

    await expect(access(tempFilePath)).rejects.toThrow();
  });
});
