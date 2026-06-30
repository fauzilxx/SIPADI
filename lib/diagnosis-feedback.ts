import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { SelectedGejalaInput } from "@/lib/knowledge-base";

export type DiagnosisFeedbackReviewStatus =
  | "pending"
  | "approved"
  | "rejected";

export interface DiagnosisFeedbackEntry {
  id: string;
  submittedAt: string;
  reviewedAt: string | null;
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

async function ensureFeedbackFile() {
  try {
    await readFile(feedbackPath, "utf8");
  } catch {
    await mkdir(path.dirname(feedbackPath), { recursive: true });
    await writeFile(
      feedbackPath,
      `${JSON.stringify(defaultFeedbackData, null, 2)}\n`,
      "utf8"
    );
  }
}

export async function readDiagnosisFeedbackFile() {
  await ensureFeedbackFile();
  const raw = await readFile(feedbackPath, "utf8");
  return JSON.parse(raw) as DiagnosisFeedbackFileData;
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

  const currentData = await readDiagnosisFeedbackFile();
  const nextEntry: DiagnosisFeedbackEntry = {
    id: `FDB-${Date.now()}`,
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewStatus: "pending",
    showAsPublicCard: false,
    reviewerNotes: "",
    ...validated.data,
  };

  const nextData: DiagnosisFeedbackFileData = {
    ...currentData,
    feedback: [...currentData.feedback, nextEntry],
  };

  await writeFile(feedbackPath, `${JSON.stringify(nextData, null, 2)}\n`, "utf8");

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

  await writeFile(
    feedbackPath,
    `${JSON.stringify(
      {
        ...currentData,
        feedback: nextFeedback,
      },
      null,
      2
    )}\n`,
    "utf8"
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
