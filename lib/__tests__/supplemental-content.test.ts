import { describe, expect, it } from "vitest";

import {
  getHydratedRecommendationByPenyakitId,
  validateSupplementalContentAgainstKnowledgeBaseData,
  validateSupplementalContentIntegrity,
} from "@/lib/supplemental-content";
import type { KnowledgeBaseData } from "@/lib/knowledge-base";

describe("supplemental content links", () => {
  it("meresolve semua productIds untuk seluruh penyakit yang punya rekomendasi", () => {
    const penyakitIds = [
      "P01",
      "P02",
      "P03",
      "P04",
      "P05",
      "P06",
      "P07",
      "P08",
      "P09",
      "P10",
      "P11",
      "P12",
      "P13",
    ];

    for (const penyakitId of penyakitIds) {
      const recommendation = getHydratedRecommendationByPenyakitId(penyakitId);

      expect(recommendation, `rekomendasi ${penyakitId} harus ada`).not.toBeNull();
      if (!recommendation) {
        continue;
      }

      expect(
        recommendation.marketplaceProducts.length,
        `produk marketplace ${penyakitId} harus terhubung`
      ).toBe(recommendation.productIds.marketplace.length);
      expect(
        recommendation.nonChemicalControls.length,
        `pengendali non-kimia ${penyakitId} harus terhubung`
      ).toBe(recommendation.productIds.nonKimia.length);
    }
  });

  it("menjaga integritas lintas-file untuk productIds, ID unik, dan gambar", () => {
    const report = validateSupplementalContentIntegrity();

    expect(report.errors).toEqual([]);
  });

  it("mendeteksi ketidaksinkronan antara knowledge base dan supplemental content", () => {
    const knowledgeBaseData: KnowledgeBaseData = {
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
      ],
      penyakit: [
        {
          id: "P99",
          nama: "Penyakit Tanpa Supplemental",
          jenis: "penyakit",
          aturan: [
            {
              gejala_id: "G01",
              cf: 0.8,
              ket: "Gejala kuat",
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

    const report = validateSupplementalContentAgainstKnowledgeBaseData(
      knowledgeBaseData,
      {
        rekomendasi: [],
        marketplaceProducts: [],
        nonChemicalControls: [],
      }
    );

    expect(report.supplementalSyncErrors.some((error) => error.includes("P99"))).toBe(
      true
    );
  });

  it("mendeteksi rekomendasi yang belum layak ditampilkan di halaman hasil", () => {
    const knowledgeBaseData: KnowledgeBaseData = {
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
              ket: "Gejala kuat",
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

    const report = validateSupplementalContentAgainstKnowledgeBaseData(
      knowledgeBaseData,
      {
        rekomendasi: [
          {
            penyakit_id: "P01",
            nama: "Penyakit 1",
            productIds: {
              marketplace: [],
              nonKimia: [],
            },
            solusi: {
              kimia: [],
              mekanis: [],
              biologis: [],
            },
            pencegahan_jangka_pendek: [],
            pencegahan_jangka_panjang: [],
            sumber: [],
          },
        ],
        marketplaceProducts: [],
        nonChemicalControls: [],
      }
    );

    expect(
      report.displayReadinessErrors.some((error) => error.includes("layak ditampilkan"))
    ).toBe(true);
  });
});
