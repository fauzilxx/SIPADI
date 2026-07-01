import type { DashboardUserRole } from "@/lib/expert-auth";

export type TabKey =
  | "overview"
  | "feedback"
  | "usulan"
  | "gejala"
  | "penyakit"
  | "cf";

export type SaveErrorCategoryKey =
  | "knowledgeBase"
  | "supplementalSync"
  | "displayReadiness";

export interface SaveErrorCategories {
  knowledgeBase: string[];
  supplementalSync: string[];
  displayReadiness: string[];
}

export interface SaveState {
  type: "idle" | "success" | "error";
  message: string;
  errors?: string[];
  errorCategories?: SaveErrorCategories | null;
}

export interface FeedbackSummary {
  totalFeedback: number;
  totalAccurate: number;
  totalInaccurate: number;
  accuracyPercentage: number;
  averageRating: number;
}

export interface FeedbackEntry {
  id: string;
  submitterName: string;
  submittedAt: string;
  reviewedAt: string | null;
  diagnosisPenyakitId: string;
  diagnosisNama: string;
  diagnosisConfidence: number;
  isAccurate: boolean;
  rating: number;
  comment: string;
  reviewStatus: "pending" | "approved" | "rejected";
  showAsPublicCard: boolean;
  reviewerNotes: string;
  selectedGejala: { id: string; cfUser: number }[];
}

export interface ChangeRequestEntry {
  id: string;
  submittedAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  appliedAt: string | null;
  status: "pending" | "approved" | "rejected" | "applied";
  title: string;
  requestType:
    | "upsert_gejala"
    | "add_gejala"
    | "revise_aturan"
    | "revise_solusi"
    | "revise_pencegahan"
    | "general";
  targetPenyakitId: string;
  targetGejalaId: string;
  description: string;
  proposedChange: string;
  reviewerNotes: string;
  applicationSummary: string;
  submittedByUsername: string;
  submittedByRole: DashboardUserRole;
  reviewedByUsername: string | null;
  appliedByUsername: string | null;
  structuredPayload:
    | {
        type: "upsert_gejala";
        mode: "create" | "update";
        gejala: {
          id: string;
          label: string;
          kelompok: string;
        };
        relationRules?: {
          penyakitId: string;
          cf: number;
          ket: string;
        }[] | null;
        previousValue?: {
          id: string;
          label: string;
          kelompok: string;
        } | null;
      }
    | {
        type: "add_gejala";
        gejalaId: string;
        gejalaLabel: string;
        kelompok: string;
      }
    | {
        type: "revise_aturan";
        penyakitId: string;
        gejalaId: string;
        cf: number;
        ket: string;
      }
    | {
        type: "revise_solusi";
        penyakitId: string;
        penanganan: string[];
      }
    | {
        type: "revise_pencegahan";
        penyakitId: string;
        pencegahan: string[];
      }
    | null;
}

export interface GejalaRelationDraft {
  cf: string;
  ket: string;
}

export interface GejalaProposalDraft {
  id: string;
  label: string;
  kelompok: string;
  relationRules: Record<string, GejalaRelationDraft>;
}

export interface ChangeRequestFormState {
  title: string;
  requestType: ChangeRequestEntry["requestType"];
  targetPenyakitId: string;
  targetGejalaId: string;
  description: string;
  proposedChange: string;
  proposedKelompok: string;
  proposedGejalaLabel: string;
  proposedCf: string;
  proposedKet: string;
  proposedPenanganan: string;
  proposedPencegahan: string;
}

export const tabs: { id: TabKey; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "feedback", label: "Feedback Petani" },
  { id: "usulan", label: "Usulan Pakar" },
  { id: "gejala", label: "Kelola Gejala" },
  { id: "penyakit", label: "Penyakit & Solusi" },
  { id: "cf", label: "Matriks CF" },
];

export const saveErrorCategoryMeta: Record<
  SaveErrorCategoryKey,
  {
    title: string;
    description: string;
    actionHint: string;
  }
> = {
  knowledgeBase: {
    title: "Knowledge Base",
    description:
      "Struktur atau isi basis pengetahuan utama belum lolos validasi.",
    actionHint:
      "Periksa gejala, penyakit, aturan, atau field inti yang sedang Anda edit di dashboard.",
  },
  supplementalSync: {
    title: "Sinkronisasi Supplemental",
    description:
      "Data supplemental belum selaras dengan penyakit aktif atau referensi productIds di knowledge base.",
    actionHint:
      "Cocokkan ID penyakit aktif dengan dataset rekomendasi, produk marketplace, dan pengendali non-kimia terkait.",
  },
  displayReadiness: {
    title: "Kelayakan Hasil /hasil",
    description:
      "Konten hasil diagnosis belum cukup siap untuk ditampilkan dengan aman di halaman hasil.",
    actionHint:
      "Lengkapi solusi atau pencegahan yang dibutuhkan agar diagnosis tetap layak ditampilkan ke pengguna akhir.",
  },
};
