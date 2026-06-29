import { existsSync } from "node:fs";
import path from "node:path";

import marketplaceData from "@/data/marketplace_produk.json";
import nonChemicalData from "@/data/pengendali_non_kimia.json";
import recommendationData from "@/data/rekomendasi_pencegahan.json";

export interface RecommendationSource {
  judul: string;
  penerbit: string;
  url: string;
  tahun: string;
}

export interface RecommendationSolutionGroup {
  kimia: string[];
  mekanis: string[];
  biologis: string[];
}

export interface RecommendationProductLinks {
  marketplace: string[];
  nonKimia: string[];
}

export interface RecommendationEntry {
  penyakit_id: string;
  nama: string;
  productIds: RecommendationProductLinks;
  solusi: RecommendationSolutionGroup;
  pencegahan_jangka_pendek: string[];
  pencegahan_jangka_panjang: string[];
  sumber: RecommendationSource[];
}

export interface MarketplaceProduct {
  id: string;
  productName: string;
  activeIngredient: string;
  category: string;
  imageFileName: string;
  catatanPenggunaan: string;
  marketplaceLinks: {
    shopee?: string;
    tokopedia?: string;
    blibli?: string;
  };
}

export interface NonChemicalControlItem {
  id: string;
  nama: string;
  slug: string;
  jenis: string;
  punyaFotoProduk: boolean;
  imageFileName?: string;
  deskripsi: string;
  catatanPenggunaan: string;
  marketplaceSearchLinks?: {
    shopee?: string;
    tokopedia?: string;
    blibli?: string;
  };
}

export interface HydratedRecommendationEntry extends RecommendationEntry {
  marketplaceProducts: MarketplaceProduct[];
  nonChemicalControls: NonChemicalControlItem[];
  unresolvedMarketplaceProductIds: string[];
  unresolvedNonChemicalControlIds: string[];
  missingMarketplaceProductImageIds: string[];
  missingNonChemicalImageIds: string[];
}

export interface SupplementalContentValidationReport {
  errors: string[];
  warnings: string[];
}

const recommendationList = (
  recommendationData as { rekomendasi: RecommendationEntry[] }
).rekomendasi;
const marketplaceProducts = (marketplaceData as { produk: MarketplaceProduct[] })
  .produk;
const nonChemicalItems = (nonChemicalData as { items: NonChemicalControlItem[] })
  .items;

const marketplaceProductMap = new Map(
  marketplaceProducts.map((item) => [item.id, item])
);
const nonChemicalItemMap = new Map(
  nonChemicalItems.map((item) => [item.id, item])
);

const productImageDirectory = path.join(
  process.cwd(),
  "public",
  "images",
  "bahanaktif+kemasan"
);
const nonChemicalImageDirectory = path.join(
  process.cwd(),
  "public",
  "images",
  "pengendali-non-kimia"
);

function resolveIds<T>(ids: string[], sourceMap: Map<string, T>) {
  return ids.flatMap((id) => {
    const resolved = sourceMap.get(id);
    return resolved ? [resolved] : [];
  });
}

function findMissingIds<T>(ids: string[], sourceMap: Map<string, T>) {
  return ids.filter((id) => !sourceMap.has(id));
}

function hasImageFile(directory: string, imageFileName: string | undefined) {
  if (!imageFileName) {
    return false;
  }

  return existsSync(path.join(directory, imageFileName));
}

function findDuplicateIds(ids: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const id of ids) {
    if (seen.has(id)) {
      duplicates.add(id);
    } else {
      seen.add(id);
    }
  }

  return Array.from(duplicates);
}

export function getHydratedRecommendationByPenyakitId(
  penyakitId: string
): HydratedRecommendationEntry | null {
  const entry =
    recommendationList.find((item) => item.penyakit_id === penyakitId) ?? null;

  if (!entry) {
    return null;
  }

  const unresolvedMarketplaceProductIds = findMissingIds(
    entry.productIds.marketplace,
    marketplaceProductMap
  );
  const unresolvedNonChemicalControlIds = findMissingIds(
    entry.productIds.nonKimia,
    nonChemicalItemMap
  );
  const resolvedMarketplaceProducts = resolveIds(
    entry.productIds.marketplace,
    marketplaceProductMap
  );
  const resolvedNonChemicalControls = resolveIds(
    entry.productIds.nonKimia,
    nonChemicalItemMap
  );

  return {
    ...entry,
    marketplaceProducts: resolvedMarketplaceProducts,
    nonChemicalControls: resolvedNonChemicalControls,
    unresolvedMarketplaceProductIds,
    unresolvedNonChemicalControlIds,
    missingMarketplaceProductImageIds: resolvedMarketplaceProducts
      .filter((item) => !hasImageFile(productImageDirectory, item.imageFileName))
      .map((item) => item.id),
    missingNonChemicalImageIds: resolvedNonChemicalControls
      .filter(
        (item) =>
          item.imageFileName &&
          !hasImageFile(nonChemicalImageDirectory, item.imageFileName)
      )
      .map((item) => item.id),
  };
}

export function validateSupplementalContentIntegrity(): SupplementalContentValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const duplicateId of findDuplicateIds(marketplaceProducts.map((item) => item.id))) {
    errors.push(`ID produk marketplace duplikat ditemukan: ${duplicateId}.`);
  }

  for (const duplicateId of findDuplicateIds(nonChemicalItems.map((item) => item.id))) {
    errors.push(`ID pengendali non-kimia duplikat ditemukan: ${duplicateId}.`);
  }

  for (const duplicateId of findDuplicateIds(recommendationList.map((item) => item.penyakit_id))) {
    errors.push(`ID rekomendasi penyakit duplikat ditemukan: ${duplicateId}.`);
  }

  for (const item of marketplaceProducts) {
    if (!hasImageFile(productImageDirectory, item.imageFileName)) {
      errors.push(
        `Gambar produk marketplace ${item.id} tidak ditemukan: ${item.imageFileName}.`
      );
    }
  }

  for (const item of nonChemicalItems) {
    if (item.imageFileName && !hasImageFile(nonChemicalImageDirectory, item.imageFileName)) {
      errors.push(
        `Gambar pengendali non-kimia ${item.id} tidak ditemukan: ${item.imageFileName}.`
      );
    }
  }

  for (const recommendation of recommendationList) {
    const unresolvedMarketplace = findMissingIds(
      recommendation.productIds.marketplace,
      marketplaceProductMap
    );
    const unresolvedNonChemical = findMissingIds(
      recommendation.productIds.nonKimia,
      nonChemicalItemMap
    );

    if (unresolvedMarketplace.length > 0) {
      errors.push(
        `Rekomendasi ${recommendation.penyakit_id} merujuk productIds.marketplace yang tidak ada: ${unresolvedMarketplace.join(", ")}.`
      );
    }

    if (unresolvedNonChemical.length > 0) {
      errors.push(
        `Rekomendasi ${recommendation.penyakit_id} merujuk productIds.nonKimia yang tidak ada: ${unresolvedNonChemical.join(", ")}.`
      );
    }

    if (
      recommendation.productIds.marketplace.length === 0 &&
      recommendation.productIds.nonKimia.length === 0
    ) {
      warnings.push(
        `Rekomendasi ${recommendation.penyakit_id} belum memiliki productIds terhubung.`
      );
    }
  }

  return { errors, warnings };
}
