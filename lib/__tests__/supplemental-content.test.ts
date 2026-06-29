import { describe, expect, it } from "vitest";

import {
  getHydratedRecommendationByPenyakitId,
  validateSupplementalContentIntegrity,
} from "@/lib/supplemental-content";

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
});
