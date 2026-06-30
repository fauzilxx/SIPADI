import { readFile } from "node:fs/promises";
import path from "node:path";

import { readAppDocument, writeAppDocument } from "@/lib/app-documents";
import type {
  MarketplaceProduct,
  NonChemicalControlItem,
  RecommendationEntry,
} from "@/lib/supplemental-content";

const recommendationPath = path.join(
  process.cwd(),
  "data",
  "rekomendasi_pencegahan.json"
);
const marketplacePath = path.join(
  process.cwd(),
  "data",
  "marketplace_produk.json"
);
const nonChemicalPath = path.join(
  process.cwd(),
  "data",
  "pengendali_non_kimia.json"
);

export interface SupplementalContentBundle {
  rekomendasi: RecommendationEntry[];
  marketplaceProducts: MarketplaceProduct[];
  nonChemicalControls: NonChemicalControlItem[];
}

const recommendationDocumentKey = "supplemental_recommendations";
const marketplaceDocumentKey = "supplemental_marketplace_products";
const nonChemicalDocumentKey = "supplemental_non_chemical_controls";

export async function readSupplementalContentFiles(): Promise<SupplementalContentBundle> {
  const [recommendationDocument, marketplaceDocument, nonChemicalDocument] =
    await Promise.all([
      readAppDocument<{ rekomendasi: RecommendationEntry[] }>(
        recommendationDocumentKey
      ),
      readAppDocument<{ produk: MarketplaceProduct[] }>(marketplaceDocumentKey),
      readAppDocument<{ items: NonChemicalControlItem[] }>(nonChemicalDocumentKey),
    ]);

  if (
    recommendationDocument?.rekomendasi &&
    marketplaceDocument?.produk &&
    nonChemicalDocument?.items
  ) {
    return {
      rekomendasi: recommendationDocument.rekomendasi,
      marketplaceProducts: marketplaceDocument.produk,
      nonChemicalControls: nonChemicalDocument.items,
    };
  }

  const [recommendationRaw, marketplaceRaw, nonChemicalRaw] = await Promise.all([
    readFile(recommendationPath, "utf8"),
    readFile(marketplacePath, "utf8"),
    readFile(nonChemicalPath, "utf8"),
  ]);

  return {
    rekomendasi: (JSON.parse(recommendationRaw) as { rekomendasi: RecommendationEntry[] })
      .rekomendasi,
    marketplaceProducts: (
      JSON.parse(marketplaceRaw) as { produk: MarketplaceProduct[] }
    ).produk,
    nonChemicalControls: (
      JSON.parse(nonChemicalRaw) as { items: NonChemicalControlItem[] }
    ).items,
  };
}

export async function syncSupplementalContentToSupabase(
  bundle: SupplementalContentBundle,
  updatedByUsername?: string | null
) {
  const results = await Promise.all([
    writeAppDocument(
      recommendationDocumentKey,
      { rekomendasi: bundle.rekomendasi },
      updatedByUsername
    ),
    writeAppDocument(
      marketplaceDocumentKey,
      { produk: bundle.marketplaceProducts },
      updatedByUsername
    ),
    writeAppDocument(
      nonChemicalDocumentKey,
      { items: bundle.nonChemicalControls },
      updatedByUsername
    ),
  ]);

  return results.every(Boolean);
}

export function getSupplementalContentPaths() {
  return {
    recommendationPath,
    marketplacePath,
    nonChemicalPath,
  };
}
