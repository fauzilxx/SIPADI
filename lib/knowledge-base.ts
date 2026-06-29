import knowledgeBase from "@/knowledge_base_v2.json";

export interface Gejala {
  id: string;
  label: string;
  kelompok: string;
}

export interface AturanEntry {
  gejala_id: string;
  cf: number;
  ket: string;
}

export interface Treatment {
  penanganan: string[];
  pencegahan: string[];
}

export interface Penyakit {
  id: string;
  nama: string;
  jenis: "hama" | "penyakit";
  organisme?: string;
  fase_rentan?: string[];
  sumber?: string[];
  aturan: AturanEntry[];
  solusi?: Treatment;
}

export interface KnowledgeBaseMeta {
  nama_proyek?: string;
  metode?: string;
  versi?: string;
  [key: string]: unknown;
}

export interface KnowledgeBaseFormula {
  threshold_tampil?: number;
  [key: string]: unknown;
}

export interface KnowledgeBaseData {
  _meta: KnowledgeBaseMeta;
  gejala: Gejala[];
  penyakit: Penyakit[];
  cf_formula: KnowledgeBaseFormula;
  [key: string]: unknown;
}

export interface SelectedGejalaInput {
  id: string;
  cfUser: number;
}

export interface KelompokOption {
  id: string;
  label: string;
  gejalaCount: number;
}

export interface PenyakitImageAsset {
  src: string;
  alt: string;
}

const kelompokLabels: Record<string, string> = {
  A: "Gejala pada Daun",
  B: "Gejala pada Batang & Anakan",
  C: "Gejala pada Malai & Bulir",
  D: "Tanda Organisme & Pola Serangan",
  E: "Kondisi Lingkungan",
};

const penyakitImageFileNames: Record<string, string> = {
  P01: "wereng.png",
  P02: "penggerek_batang_padi.png",
  P03: "walang_sangit.png",
  P04: "keong_mas.png",
  P05: "tikus_sawah.png",
  P06: "blast.png",
  P07: "hawar_daun_padi.png",
  P08: "tungro.png",
  P09: "brown_spot.png",
  P10: "busuk_pelapah.png",
  P11: "ganjur.png",
  P12: "ulat_grayak.png",
  P13: "kerdil_rumput.png",
};

export function getKnowledgeBaseData(): KnowledgeBaseData {
  return knowledgeBase as KnowledgeBaseData;
}

export function getThreshold() {
  return (
    (getKnowledgeBaseData().cf_formula as { threshold_tampil?: number })
      .threshold_tampil ?? 0.2
  );
}

export function getGejalaList(): Gejala[] {
  return getKnowledgeBaseData().gejala;
}

export function getPenyakitList(): Penyakit[] {
  return getKnowledgeBaseData().penyakit;
}

export function getPenyakitImageAsset(
  penyakitId: string
): PenyakitImageAsset | null {
  const penyakit = getPenyakitList().find((item) => item.id === penyakitId);
  const imageFileName = penyakitImageFileNames[penyakitId];

  if (!penyakit || !imageFileName) {
    return null;
  }

  return {
    src: `/images/penyakit&hama/${imageFileName}`,
    alt: `Ilustrasi ${penyakit.nama}`,
  };
}

export function getGejalaMap() {
  return new Map(getGejalaList().map((gejala) => [gejala.id, gejala]));
}

export function getKelompokLabel(kelompokId: string) {
  return kelompokLabels[kelompokId] ?? `Kelompok ${kelompokId}`;
}

export function getKelompokOptions(): KelompokOption[] {
  const grouped = new Map<string, number>();

  for (const gejala of getGejalaList()) {
    grouped.set(gejala.kelompok, (grouped.get(gejala.kelompok) ?? 0) + 1);
  }

  return Array.from(grouped.entries()).map(([id, gejalaCount]) => ({
    id,
    label: getKelompokLabel(id),
    gejalaCount,
  }));
}

export function getGejalaByKelompok(kelompokIds?: string[]) {
  if (!kelompokIds || kelompokIds.length === 0) {
    return getGejalaList();
  }

  const kelompokSet = new Set(kelompokIds);
  return getGejalaList().filter((gejala) => kelompokSet.has(gejala.kelompok));
}

export function getKelompokByGejalaIds(gejalaIds: string[]) {
  const gejalaMap = getGejalaMap();
  const selectedKelompok = new Set<string>();

  for (const gejalaId of gejalaIds) {
    const gejala = gejalaMap.get(gejalaId);
    if (gejala) {
      selectedKelompok.add(gejala.kelompok);
    }
  }

  return Array.from(selectedKelompok);
}

export function getTreatment(penyakitId: string): Treatment {
  const penyakit = getPenyakitList().find((item) => item.id === penyakitId);

  return (
    penyakit?.solusi ?? {
      penanganan: [
        "Konsultasikan dengan petugas penyuluh pertanian (PPL) terdekat.",
      ],
      pencegahan: [
        "Terapkan budidaya tanaman sehat dan pantau sawah secara rutin.",
      ],
    }
  );
}

export function validateSelectedGejala(input: unknown): {
  data: SelectedGejalaInput[];
  errors: string[];
} {
  if (!Array.isArray(input)) {
    return {
      data: [],
      errors: ["Payload selectedGejala harus berupa array."],
    };
  }

  const gejalaMap = getGejalaMap();
  const seenIds = new Set<string>();
  const data: SelectedGejalaInput[] = [];
  const errors: string[] = [];

  for (const item of input) {
    if (!item || typeof item !== "object") {
      errors.push("Setiap input gejala harus berupa object.");
      continue;
    }

    const candidate = item as Partial<SelectedGejalaInput>;
    const id = typeof candidate.id === "string" ? candidate.id.trim() : "";
    const cfUser = candidate.cfUser;

    if (!id) {
      errors.push("ID gejala tidak boleh kosong.");
      continue;
    }

    if (!gejalaMap.has(id)) {
      errors.push(`Gejala ${id} tidak dikenal.`);
      continue;
    }

    if (seenIds.has(id)) {
      errors.push(`Gejala ${id} dikirim lebih dari sekali.`);
      continue;
    }

    if (typeof cfUser !== "number" || Number.isNaN(cfUser)) {
      errors.push(`Nilai keyakinan untuk ${id} harus berupa angka.`);
      continue;
    }

    if (cfUser < 0.1 || cfUser > 1) {
      errors.push(`Nilai keyakinan untuk ${id} harus di antara 0.1 sampai 1.`);
      continue;
    }

    seenIds.add(id);
    data.push({
      id,
      cfUser: Math.round(cfUser * 100) / 100,
    });
  }

  if (data.length === 0 && errors.length === 0) {
    errors.push("Pilih minimal satu gejala untuk melakukan diagnosis.");
  }

  return { data, errors };
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isTreatment(value: unknown): value is Treatment {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Treatment>;
  return (
    isStringArray(candidate.penanganan) && isStringArray(candidate.pencegahan)
  );
}

export function validateKnowledgeBaseData(input: unknown): {
  data: KnowledgeBaseData | null;
  errors: string[];
} {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return {
      data: null,
      errors: ["Payload knowledge base harus berupa object."],
    };
  }

  const candidate = input as Partial<KnowledgeBaseData>;

  if (!candidate._meta || typeof candidate._meta !== "object") {
    errors.push("Bagian _meta wajib ada dan harus berupa object.");
  }

  if (!candidate.cf_formula || typeof candidate.cf_formula !== "object") {
    errors.push("Bagian cf_formula wajib ada dan harus berupa object.");
  }

  if (!Array.isArray(candidate.gejala) || candidate.gejala.length === 0) {
    errors.push("Daftar gejala wajib ada dan tidak boleh kosong.");
  }

  if (!Array.isArray(candidate.penyakit) || candidate.penyakit.length === 0) {
    errors.push("Daftar penyakit wajib ada dan tidak boleh kosong.");
  }

  if (errors.length > 0) {
    return { data: null, errors };
  }

  const gejalaIds = new Set<string>();
  for (const gejala of candidate.gejala!) {
    if (!gejala?.id || !gejala.label || !gejala.kelompok) {
      errors.push("Setiap gejala harus memiliki id, label, dan kelompok.");
      continue;
    }

    if (gejalaIds.has(gejala.id)) {
      errors.push(`ID gejala duplikat ditemukan: ${gejala.id}.`);
      continue;
    }

    gejalaIds.add(gejala.id);
  }

  const penyakitIds = new Set<string>();
  for (const penyakit of candidate.penyakit!) {
    if (!penyakit?.id || !penyakit.nama || !penyakit.jenis) {
      errors.push("Setiap penyakit harus memiliki id, nama, dan jenis.");
      continue;
    }

    if (penyakit.jenis !== "hama" && penyakit.jenis !== "penyakit") {
      errors.push(`Jenis ${penyakit.id} harus 'hama' atau 'penyakit'.`);
    }

    if (!Array.isArray(penyakit.aturan) || penyakit.aturan.length === 0) {
      errors.push(`Penyakit ${penyakit.id} harus memiliki aturan minimal satu.`);
    }

    if (penyakitIds.has(penyakit.id)) {
      errors.push(`ID penyakit duplikat ditemukan: ${penyakit.id}.`);
    } else {
      penyakitIds.add(penyakit.id);
    }

    if (penyakit.solusi && !isTreatment(penyakit.solusi)) {
      errors.push(
        `Solusi untuk ${penyakit.id} harus berisi array penanganan dan pencegahan.`
      );
    }

    for (const rule of penyakit.aturan ?? []) {
      if (!gejalaIds.has(rule.gejala_id)) {
        errors.push(
          `Aturan ${penyakit.id} merujuk gejala yang tidak ada: ${rule.gejala_id}.`
        );
      }

      if (typeof rule.cf !== "number" || Number.isNaN(rule.cf)) {
        errors.push(`Nilai CF pada ${penyakit.id}/${rule.gejala_id} harus angka.`);
      } else if (rule.cf < -1 || rule.cf > 1) {
        errors.push(
          `Nilai CF pada ${penyakit.id}/${rule.gejala_id} harus di antara -1 dan 1.`
        );
      }

      if (typeof rule.ket !== "string" || rule.ket.trim().length === 0) {
        errors.push(
          `Keterangan aturan pada ${penyakit.id}/${rule.gejala_id} tidak boleh kosong.`
        );
      }
    }
  }

  const threshold = candidate.cf_formula?.threshold_tampil;
  if (
    typeof threshold !== "number" ||
    Number.isNaN(threshold) ||
    threshold < 0 ||
    threshold > 1
  ) {
    errors.push("cf_formula.threshold_tampil harus berupa angka antara 0 dan 1.");
  }

  return {
    data: errors.length === 0 ? (candidate as KnowledgeBaseData) : null,
    errors,
  };
}
