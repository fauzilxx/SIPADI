import type { DiagnosisResult } from "@/lib/diagnosis";
import type { SelectedGejalaInput, Treatment } from "@/lib/knowledge-base";

export interface DiagnosisApiResponse {
  success: boolean;
  message?: string;
  errors?: string[];
  selectedGejala?: SelectedGejalaInput[];
  selectedKelompok?: { id: string; label: string }[];
  totalSelectedGejala?: number;
  results?: DiagnosisResult[];
  topResult?: DiagnosisResult | null;
  topResultLabel?: string | null;
  treatment?: Treatment | null;
  supplementalRecommendation?: SupplementalRecommendation | null;
}

export interface FeedbackSummary {
  totalFeedback: number;
  totalAccurate: number;
  totalInaccurate: number;
  accuracyPercentage: number;
  averageRating: number;
}

export interface PublicFeedbackCard {
  id: string;
  submitterName: string;
  diagnosisNama: string;
  isAccurate: boolean;
  rating: number;
  comment: string;
}

export interface FeedbackApiResponse {
  success: boolean;
  message?: string;
  errors?: string[];
  summary?: FeedbackSummary;
  publicCards?: PublicFeedbackCard[];
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

export interface SupplementalRecommendation {
  penyakit_id: string;
  nama: string;
  productIds: {
    marketplace: string[];
    nonKimia: string[];
  };
  solusi: {
    kimia: string[];
    mekanis: string[];
    biologis: string[];
  };
  pencegahan_jangka_pendek: string[];
  pencegahan_jangka_panjang: string[];
  marketplaceProducts: MarketplaceProduct[];
  nonChemicalControls: NonChemicalControlItem[];
  unresolvedMarketplaceProductIds: string[];
  unresolvedNonChemicalControlIds: string[];
  missingMarketplaceProductImageIds: string[];
  missingNonChemicalImageIds: string[];
}

export interface FeedbackFormState {
  submitterName: string;
  isAccurate: "" | "yes" | "no";
  rating: number;
  comment: string;
}
