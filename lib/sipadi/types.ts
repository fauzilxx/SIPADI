export interface Evidence {
  gejalaId: string;
  cfUser: number;
}

export interface Rekomendasi {
  penanganan_jangka_pendek: string[];
  pencegahan_jangka_panjang: string[];
}

export interface Aturan {
  gejala_id: string;
  cf: number;
  ket: string;
}

export interface Penyakit {
  id: string;
  nama: string;
  jenis: "penyakit" | "hama";
  organisme?: string;
  fase_rentan?: string[];
  sumber?: string[];
  rekomendasi?: Rekomendasi;
  aturan: Aturan[];
}

export interface Gejala {
  id: string;
  label: string;
  kelompok: string;
}

export interface KnowledgeBase {
  _meta: Record<string, unknown>;
  gejala: Gejala[];
  penyakit: Penyakit[];
  cf_formula: Record<string, unknown>;
}

export interface HasilDiagnosis {
  penyakitId: string;
  nama: string;
  jenis: "penyakit" | "hama";
  cfTotal: number;
  organisme?: string;
  fase_rentan?: string[];
  rekomendasi?: Rekomendasi;
}
