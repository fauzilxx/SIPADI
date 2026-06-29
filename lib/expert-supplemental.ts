import { readFile } from "node:fs/promises";
import path from "node:path";

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

export async function readSupplementalContentFiles(): Promise<SupplementalContentBundle> {
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

export function getSupplementalContentPaths() {
  return {
    recommendationPath,
    marketplacePath,
    nonChemicalPath,
  };
}
