import { type Evidence } from "./types";

export type KelompokId = "A" | "B" | "C" | "D" | "E";

export interface KelompokInfo {
  id: KelompokId;
  label: string;
  deskripsi: string;
  icon: string;
}

export const KELOMPOK_INFO: Record<KelompokId, KelompokInfo> = {
  A: { id: "A", label: "Kondisi Daun", deskripsi: "Perubahan warna, bercak, atau kerusakan pada helai daun", icon: "🌿" },
  B: { id: "B", label: "Kondisi Batang & Anakan", deskripsi: "Kerusakan atau kelainan pada batang, pucuk, dan anakan", icon: "🌾" },
  C: { id: "C", label: "Kondisi Malai & Gabah", deskripsi: "Kerusakan pada malai, gabah, atau beras", icon: "🌻" },
  D: { id: "D", label: "Tanda Organisme / Hama", deskripsi: "Keberadaan serangga, hewan, atau tanda fisik hama", icon: "🐛" },
  E: { id: "E", label: "Kondisi Lingkungan", deskripsi: "Cuaca, pemupukan, dan fase pertumbuhan tanaman", icon: "☁️" },
};

export interface GejalaItem {
  id: string;
  label: string;
  kelompok: KelompokId;
}

export const SEMUA_GEJALA: GejalaItem[] = [
  { id: "G01", label: "Daun menguning merata dan cepat", kelompok: "A" },
  { id: "G02", label: "Daun menguning dari tepi (hawar)", kelompok: "A" },
  { id: "G03", label: "Daun coklat dan kering seperti terbakar", kelompok: "A" },
  { id: "G04", label: "Bercak coklat oval/bulat di daun", kelompok: "A" },
  { id: "G05", label: "Bercak belah ketupat, tengah abu-abu", kelompok: "A" },
  { id: "G06", label: "Daun kuning-oranye, terpelintir", kelompok: "A" },
  { id: "G07", label: "Daun bawah tampak berlumpur/busuk", kelompok: "A" },
  { id: "G08", label: "Daun berlubang atau habis dimakan", kelompok: "A" },
  { id: "G30", label: "Helaian daun terpotong-potong hingga gundul dalam satu malam", kelompok: "A" },
  { id: "G33", label: "Tepi helai daun tampak bergerigi, melintir, atau berbintik hijau tua", kelompok: "A" },
  { id: "G09", label: "Pucuk/anakan muda mati (sundep/beluk)", kelompok: "B" },
  { id: "G10", label: "Batang mudah dicabut dari tanah", kelompok: "B" },
  { id: "G11", label: "Batang ada bekas gerek / lubang kecil", kelompok: "B" },
  { id: "G12", label: "Tanaman kerdil, lebih pendek dari normal", kelompok: "B" },
  { id: "G13", label: "Banyak anakan mati dalam satu rumpun", kelompok: "B" },
  { id: "G28", label: "Daun tumbuh abnormal berbentuk pipa memanjang menyerupai daun bawang", kelompok: "B" },
  { id: "G32", label: "Jumlah anakan sangat banyak dan rapat menyerupai rumput, seluruhnya kurus dan kerdil", kelompok: "B" },
  { id: "G14", label: "Malai coklat & kering sebelum waktunya", kelompok: "C" },
  { id: "G15", label: "Banyak gabah hampa / tidak berisi", kelompok: "C" },
  { id: "G16", label: "Leher malai berwarna hitam dan patah", kelompok: "C" },
  { id: "G17", label: "Beras bercak hitam/coklat saat dilihat", kelompok: "C" },
  { id: "G18", label: "Bulir padi berbau busuk atau berlendir", kelompok: "C" },
  { id: "G29", label: "Pucuk vegetatif tidak keluar malai, terbentuk struktur tubular putih", kelompok: "C" },
  { id: "G19", label: "Serangga kecil coklat di pangkal batang", kelompok: "D" },
  { id: "G20", label: "Serangga berbau menyengat di sekitar malai", kelompok: "D" },
  { id: "G21", label: "Ada keong / hewan bercangkang di sawah", kelompok: "D" },
  { id: "G22", label: "Tanaman dimakan dari pangkal, rumpun rebah", kelompok: "D" },
  { id: "G23", label: "Kelompok telur merah muda di batang/daun", kelompok: "D" },
  { id: "G24", label: "Serangan mulai dari tengah petak lalu meluas", kelompok: "D" },
  { id: "G31", label: "Ditemukan kelompok ulat berwarna gelap di sekitar tanah atau pangkal rumpun saat pagi/malam", kelompok: "D" },
  { id: "G34", label: "Terlihat banyak populasi wereng coklat beterbangan di lahan sawah", kelompok: "D" },
  { id: "G25", label: "Cuaca musim hujan / kelembaban tinggi", kelompok: "E" },
  { id: "G26", label: "Pemupukan nitrogen (urea) berlebihan", kelompok: "E" },
  { id: "G27", label: "Fase generatif (lebih dari 45 HST)", kelompok: "E" },
];

export const GEJALA_PER_KELOMPOK: Record<KelompokId, GejalaItem[]> = {
  A: SEMUA_GEJALA.filter((g) => g.kelompok === "A"),
  B: SEMUA_GEJALA.filter((g) => g.kelompok === "B"),
  C: SEMUA_GEJALA.filter((g) => g.kelompok === "C"),
  D: SEMUA_GEJALA.filter((g) => g.kelompok === "D"),
  E: SEMUA_GEJALA.filter((g) => g.kelompok === "E"),
};

export interface WizardState {
  evidence: Evidence[];
  kelompokSelesai: KelompokId[];
  kelompokAktif: KelompokId | null;
}

export type WizardStep =
  | { tipe: "pilih_kelompok"; kelompokTersedia: KelompokInfo[] }
  | { tipe: "tanya_gejala"; kelompok: KelompokInfo; gejala: GejalaItem[] }
  | { tipe: "selesai" };

export function nextQuestion(state: WizardState): WizardStep {
  const semuaKelompok: KelompokId[] = ["A", "B", "C", "D", "E"];
  const belumSelesai = semuaKelompok.filter(
    (k) => !state.kelompokSelesai.includes(k)
  );

  if (belumSelesai.length === 0) return { tipe: "selesai" };

  if (state.kelompokAktif !== null) {
    return {
      tipe: "tanya_gejala",
      kelompok: KELOMPOK_INFO[state.kelompokAktif],
      gejala: GEJALA_PER_KELOMPOK[state.kelompokAktif],
    };
  }

  return {
    tipe: "pilih_kelompok",
    kelompokTersedia: belumSelesai.map((k) => KELOMPOK_INFO[k]),
  };
}

export function selesaikanKelompok(state: WizardState): WizardState {
  if (state.kelompokAktif === null) return state;
  return {
    ...state,
    kelompokSelesai: [...state.kelompokSelesai, state.kelompokAktif],
    kelompokAktif: null,
  };
}

export function pilihKelompok(state: WizardState, kelompok: KelompokId): WizardState {
  return { ...state, kelompokAktif: kelompok };
}

export function initialWizardState(): WizardState {
  return { evidence: [], kelompokSelesai: [], kelompokAktif: null };
}
