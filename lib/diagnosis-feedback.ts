import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

import type { SelectedGejalaInput } from "@/lib/knowledge-base";
import { getSupabaseAdminClient } from "@/lib/supabase-server";

export type DiagnosisFeedbackReviewStatus =
  | "pending"
  | "approved"
  | "rejected";

export interface DiagnosisFeedbackEntry {
  id: string;
  submittedAt: string;
  reviewedAt: string | null;
  submitterName: string;
  diagnosisPenyakitId: string;
  diagnosisNama: string;
  diagnosisConfidence: number;
  isAccurate: boolean;
  rating: number;
  comment: string;
  reviewStatus: DiagnosisFeedbackReviewStatus;
  showAsPublicCard: boolean;
  reviewerNotes: string;
  selectedGejala: SelectedGejalaInput[];
}

export interface DiagnosisFeedbackFileData {
  _meta: {
    nama: string;
    versi: string;
    deskripsi: string;
  };
  feedback: DiagnosisFeedbackEntry[];
}

export interface DiagnosisFeedbackSummary {
  totalFeedback: number;
  totalAccurate: number;
  totalInaccurate: number;
  accuracyPercentage: number;
  averageRating: number;
}

export interface DiagnosisFeedbackInput {
  submitterName?: unknown;
  diagnosisPenyakitId?: unknown;
  diagnosisNama?: unknown;
  diagnosisConfidence?: unknown;
  isAccurate?: unknown;
  rating?: unknown;
  comment?: unknown;
  selectedGejala?: unknown;
}

export interface DiagnosisFeedbackReviewInput {
  id?: unknown;
  reviewStatus?: unknown;
  showAsPublicCard?: unknown;
  reviewerNotes?: unknown;
}

const feedbackPath = path.join(process.cwd(), "data", "diagnosis_feedback.json");
const feedbackTable = "diagnosis_feedback";

const defaultFeedbackData: DiagnosisFeedbackFileData = {
  _meta: {
    nama: "Feedback Diagnosis SIPADI",
    versi: "1.0.0",
    deskripsi:
      "Penyimpanan masukan petani terhadap hasil diagnosis untuk mengukur akurasi dan rating program.",
  },
  feedback: [],
};

function roundToTwoDecimals(value: number) {
  return Math.round(value * 100) / 100;
}

export function createFeedbackSummary(
  entries: DiagnosisFeedbackEntry[]
): DiagnosisFeedbackSummary {
  const totalFeedback = entries.length;
  const totalAccurate = entries.filter((entry) => entry.isAccurate).length;
  const totalInaccurate = totalFeedback - totalAccurate;
  const averageRating =
    totalFeedback > 0
      ? roundToTwoDecimals(
          entries.reduce((sum, entry) => sum + entry.rating, 0) / totalFeedback
        )
      : 0;
  const accuracyPercentage =
    totalFeedback > 0
      ? roundToTwoDecimals((totalAccurate / totalFeedback) * 100)
      : 0;

  return {
    totalFeedback,
    totalAccurate,
    totalInaccurate,
    accuracyPercentage,
    averageRating,
  };
}

export function validateDiagnosisFeedback(input: DiagnosisFeedbackInput): {
  data: Omit<
    DiagnosisFeedbackEntry,
    | "id"
    | "submittedAt"
    | "reviewedAt"
    | "reviewStatus"
    | "showAsPublicCard"
    | "reviewerNotes"
  > | null;
  errors: string[];
} {
  const errors: string[] = [];

  const submitterName =
    typeof input.submitterName === "string" ? input.submitterName.trim() : "";
  const diagnosisPenyakitId =
    typeof input.diagnosisPenyakitId === "string"
      ? input.diagnosisPenyakitId.trim()
      : "";
  const diagnosisNama =
    typeof input.diagnosisNama === "string" ? input.diagnosisNama.trim() : "";
  const diagnosisConfidence =
    typeof input.diagnosisConfidence === "number"
      ? input.diagnosisConfidence
      : Number.NaN;
  const isAccurate = input.isAccurate;
  const rating = input.rating;
  const comment =
    typeof input.comment === "string" ? input.comment.trim() : "";
  const selectedGejala = input.selectedGejala;

  if (!submitterName) {
    errors.push("Nama pengirim feedback wajib diisi.");
  }

  if (submitterName.length > 100) {
    errors.push("Nama pengirim feedback maksimal 100 karakter.");
  }

  if (!diagnosisPenyakitId) {
    errors.push("ID diagnosis wajib dikirim.");
  }

  if (!diagnosisNama) {
    errors.push("Nama diagnosis wajib dikirim.");
  }

  if (
    typeof diagnosisConfidence !== "number" ||
    Number.isNaN(diagnosisConfidence) ||
    diagnosisConfidence < 0 ||
    diagnosisConfidence > 100
  ) {
    errors.push("Tingkat kepercayaan diagnosis harus berupa angka 0 sampai 100.");
  }

  if (typeof isAccurate !== "boolean") {
    errors.push("Penilaian kesesuaian hasil wajib dipilih.");
  }

  if (
    typeof rating !== "number" ||
    Number.isNaN(rating) ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    errors.push("Rating program harus berupa angka 1 sampai 5.");
  }

  if (comment.length > 500) {
    errors.push("Catatan feedback maksimal 500 karakter.");
  }

  if (!Array.isArray(selectedGejala)) {
    errors.push("Data gejala terpilih wajib berupa array.");
  }

  if (errors.length > 0) {
    return { data: null, errors };
  }

  return {
    data: {
      submitterName,
      diagnosisPenyakitId,
      diagnosisNama,
      diagnosisConfidence: roundToTwoDecimals(diagnosisConfidence),
      isAccurate: isAccurate as boolean,
      rating: rating as number,
      comment,
      selectedGejala: selectedGejala as SelectedGejalaInput[],
    },
    errors,
  };
}

export function validateDiagnosisFeedbackReview(
  input: DiagnosisFeedbackReviewInput
): {
  data: {
    id: string;
    reviewStatus: DiagnosisFeedbackReviewStatus;
    showAsPublicCard: boolean;
    reviewerNotes: string;
  } | null;
  errors: string[];
} {
  const errors: string[] = [];
  const id = typeof input.id === "string" ? input.id.trim() : "";
  const reviewStatus =
    typeof input.reviewStatus === "string" ? input.reviewStatus.trim() : "";
  const reviewerNotes =
    typeof input.reviewerNotes === "string" ? input.reviewerNotes.trim() : "";

  if (!id) {
    errors.push("ID feedback wajib dikirim.");
  }

  if (
    reviewStatus !== "pending" &&
    reviewStatus !== "approved" &&
    reviewStatus !== "rejected"
  ) {
    errors.push("Status review feedback tidak valid.");
  }

  if (typeof input.showAsPublicCard !== "boolean") {
    errors.push("Status tampil publik feedback harus berupa boolean.");
  }

  if (reviewerNotes.length > 500) {
    errors.push("Catatan review maksimal 500 karakter.");
  }

  if (errors.length > 0) {
    return { data: null, errors };
  }

  return {
    data: {
      id,
      reviewStatus: reviewStatus as DiagnosisFeedbackReviewStatus,
      showAsPublicCard: input.showAsPublicCard as boolean,
      reviewerNotes,
    },
    errors,
  };
}

async function writeFileWithRetry(
  filePath: string,
  content: string,
  maxAttempts = 3,
  delayMs = 200
): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await writeFile(filePath, content, "utf8");
      return;
    } catch (err) {
      lastError = err;
      console.warn(
        `[diagnosis-feedback] writeFile attempt ${attempt}/${maxAttempts} failed:`,
        err
      );
      if (attempt < maxAttempts) {
        await delay(delayMs);
      }
    }
  }

  throw lastError;
}

async function ensureFeedbackFile() {
  try {
    await readFile(feedbackPath, "utf8");
  } catch {
    await mkdir(path.dirname(feedbackPath), { recursive: true });
    await writeFileWithRetry(
      feedbackPath,
      `${JSON.stringify(defaultFeedbackData, null, 2)}\n`
    );
  }
}

interface DiagnosisFeedbackRow {
  id: string;
  submitted_at: string;
  reviewed_at: string | null;
  submitter_name: string | null;
  diagnosis_penyakit_id: string;
  diagnosis_nama: string;
  diagnosis_confidence: number;
  is_accurate: boolean;
  rating: number;
  comment: string;
  review_status: DiagnosisFeedbackReviewStatus;
  show_as_public_card: boolean;
  reviewer_notes: string;
  selected_gejala: SelectedGejalaInput[];
}

function mapRowToEntry(row: DiagnosisFeedbackRow): DiagnosisFeedbackEntry {
  return {
    id: row.id,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    submitterName: row.submitter_name?.trim() || "Pengguna SIPADI",
    diagnosisPenyakitId: row.diagnosis_penyakit_id,
    diagnosisNama: row.diagnosis_nama,
    diagnosisConfidence: row.diagnosis_confidence,
    isAccurate: row.is_accurate,
    rating: row.rating,
    comment: row.comment,
    reviewStatus: row.review_status,
    showAsPublicCard: row.show_as_public_card,
    reviewerNotes: row.reviewer_notes,
    selectedGejala: row.selected_gejala,
  };
}

function mapEntryToRow(entry: DiagnosisFeedbackEntry): DiagnosisFeedbackRow {
  return {
    id: entry.id,
    submitted_at: entry.submittedAt,
    reviewed_at: entry.reviewedAt,
    submitter_name: entry.submitterName,
    diagnosis_penyakit_id: entry.diagnosisPenyakitId,
    diagnosis_nama: entry.diagnosisNama,
    diagnosis_confidence: entry.diagnosisConfidence,
    is_accurate: entry.isAccurate,
    rating: entry.rating,
    comment: entry.comment,
    review_status: entry.reviewStatus,
    show_as_public_card: entry.showAsPublicCard,
    reviewer_notes: entry.reviewerNotes,
    selected_gejala: entry.selectedGejala,
  };
}

function normalizeFeedbackEntry(
  entry: DiagnosisFeedbackEntry | (Partial<DiagnosisFeedbackEntry> & { id: string })
): DiagnosisFeedbackEntry {
  return {
    ...entry,
    submitterName: entry.submitterName?.trim() || "Pengguna SIPADI",
  } as DiagnosisFeedbackEntry;
}

export async function readDiagnosisFeedbackFile() {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase
      .from(feedbackTable)
      .select(
        "id, submitted_at, reviewed_at, submitter_name, diagnosis_penyakit_id, diagnosis_nama, diagnosis_confidence, is_accurate, rating, comment, review_status, show_as_public_card, reviewer_notes, selected_gejala"
      )
      .order("submitted_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return {
      ...defaultFeedbackData,
      feedback: (data ?? []).map((row) => mapRowToEntry(row as DiagnosisFeedbackRow)),
    };
  }

  await ensureFeedbackFile();
  const raw = await readFile(feedbackPath, "utf8");
  const parsed = JSON.parse(raw) as DiagnosisFeedbackFileData;

  return {
    ...parsed,
    feedback: parsed.feedback.map((entry) => normalizeFeedbackEntry(entry)),
  };
}

export async function readDiagnosisFeedbackSummary() {
  const data = await readDiagnosisFeedbackFile();

  return {
    summary: createFeedbackSummary(data.feedback),
    latestFeedbackCount: data.feedback.length,
  };
}

export async function readPublicFeedbackCards() {
  const data = await readDiagnosisFeedbackFile();

  return data.feedback.filter(
    (entry) => entry.reviewStatus === "approved" && entry.showAsPublicCard
  );
}

export async function saveDiagnosisFeedback(input: DiagnosisFeedbackInput) {
  const validated = validateDiagnosisFeedback(input);

  if (!validated.data) {
    return {
      success: false as const,
      errors: validated.errors,
    };
  }

  const nextEntry: DiagnosisFeedbackEntry = {
    id: `FDB-${Date.now()}`,
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewStatus: "pending",
    showAsPublicCard: false,
    reviewerNotes: "",
    ...validated.data,
  };

  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { error } = await supabase
      .from(feedbackTable)
      .insert(mapEntryToRow(nextEntry));

    if (error) {
      throw new Error(error.message);
    }

    const refreshed = await readDiagnosisFeedbackFile();
    return {
      success: true as const,
      data: nextEntry,
      summary: createFeedbackSummary(refreshed.feedback),
    };
  }

  const currentData = await readDiagnosisFeedbackFile();

  const nextData: DiagnosisFeedbackFileData = {
    ...currentData,
    feedback: [...currentData.feedback, nextEntry],
  };

  await writeFileWithRetry(
    feedbackPath,
    `${JSON.stringify(nextData, null, 2)}\n`
  );

  return {
    success: true as const,
    data: nextEntry,
    summary: createFeedbackSummary(nextData.feedback),
  };
}

export async function reviewDiagnosisFeedback(input: DiagnosisFeedbackReviewInput) {
  const validated = validateDiagnosisFeedbackReview(input);

  if (!validated.data) {
    return {
      success: false as const,
      errors: validated.errors,
    };
  }

  const reviewData = validated.data;

  const currentData = await readDiagnosisFeedbackFile();
  const feedbackIndex = currentData.feedback.findIndex(
    (entry) => entry.id === reviewData.id
  );

  if (feedbackIndex < 0) {
    return {
      success: false as const,
      errors: ["Feedback tidak ditemukan."],
    };
  }

  const currentEntry = currentData.feedback[feedbackIndex];
  const updatedEntry: DiagnosisFeedbackEntry = {
    ...currentEntry,
    reviewStatus: reviewData.reviewStatus,
    showAsPublicCard:
      reviewData.reviewStatus === "approved"
        ? reviewData.showAsPublicCard
        : false,
    reviewerNotes: reviewData.reviewerNotes,
    reviewedAt: new Date().toISOString(),
  };

  const nextFeedback = [...currentData.feedback];
  nextFeedback[feedbackIndex] = updatedEntry;

  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { error } = await supabase
      .from(feedbackTable)
      .update({
        review_status: updatedEntry.reviewStatus,
        show_as_public_card: updatedEntry.showAsPublicCard,
        reviewer_notes: updatedEntry.reviewerNotes,
        reviewed_at: updatedEntry.reviewedAt,
      })
      .eq("id", updatedEntry.id);

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true as const,
      data: updatedEntry,
      summary: createFeedbackSummary(nextFeedback),
    };
  }

  await writeFileWithRetry(
    feedbackPath,
    `${JSON.stringify(
      {
        ...currentData,
        feedback: nextFeedback,
      },
      null,
      2
    )}\n`
  );

  return {
    success: true as const,
    data: updatedEntry,
    summary: createFeedbackSummary(nextFeedback),
  };
}

export function getDiagnosisFeedbackPath() {
  return feedbackPath;
}
