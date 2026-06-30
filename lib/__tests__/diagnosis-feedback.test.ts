import { describe, expect, it } from "vitest";

import {
  createFeedbackSummary,
  validateDiagnosisFeedback,
  validateDiagnosisFeedbackReview,
  type DiagnosisFeedbackEntry,
} from "@/lib/diagnosis-feedback";

describe("diagnosis feedback", () => {
  it("menghitung ringkasan akurasi dan rating dengan benar", () => {
    const entries: DiagnosisFeedbackEntry[] = [
      {
        id: "FDB-1",
        submittedAt: "2026-06-30T00:00:00.000Z",
        reviewedAt: "2026-06-30T01:00:00.000Z",
        submitterName: "Budi",
        diagnosisPenyakitId: "P01",
        diagnosisNama: "Wereng Batang Coklat (WBC)",
        diagnosisConfidence: 82,
        isAccurate: true,
        rating: 5,
        comment: "Sesuai kondisi lapang",
        reviewStatus: "approved",
        showAsPublicCard: true,
        reviewerNotes: "Layak tampil sebagai card publik.",
        selectedGejala: [{ id: "G19", cfUser: 1 }],
      },
      {
        id: "FDB-2",
        submittedAt: "2026-06-30T00:01:00.000Z",
        reviewedAt: null,
        submitterName: "Siti",
        diagnosisPenyakitId: "P02",
        diagnosisNama: "Penggerek Batang Padi",
        diagnosisConfidence: 64,
        isAccurate: false,
        rating: 3,
        comment: "",
        reviewStatus: "pending",
        showAsPublicCard: false,
        reviewerNotes: "",
        selectedGejala: [{ id: "G09", cfUser: 0.8 }],
      },
    ];

    const summary = createFeedbackSummary(entries);

    expect(summary.totalFeedback).toBe(2);
    expect(summary.totalAccurate).toBe(1);
    expect(summary.totalInaccurate).toBe(1);
    expect(summary.accuracyPercentage).toBe(50);
    expect(summary.averageRating).toBe(4);
  });

  it("memvalidasi payload feedback petani", () => {
    const validated = validateDiagnosisFeedback({
      submitterName: "Joko",
      diagnosisPenyakitId: "P02",
      diagnosisNama: "Penggerek Batang Padi",
      diagnosisConfidence: 50,
      isAccurate: true,
      rating: 4,
      comment: "Cukup membantu",
      selectedGejala: [{ id: "G09", cfUser: 0.9 }],
    });

    expect(validated.errors).toEqual([]);
    expect(validated.data?.submitterName).toBe("Joko");
    expect(validated.data?.rating).toBe(4);
    expect(validated.data?.isAccurate).toBe(true);
  });

  it("menolak payload yang tidak lengkap", () => {
    const validated = validateDiagnosisFeedback({
      submitterName: "",
      diagnosisPenyakitId: "",
      diagnosisNama: "",
      diagnosisConfidence: 120,
      isAccurate: "ya",
      rating: 7,
      selectedGejala: "invalid",
    });

    expect(validated.data).toBeNull();
    expect(validated.errors.length).toBeGreaterThan(0);
  });

  it("memvalidasi payload review feedback admin", () => {
    const validated = validateDiagnosisFeedbackReview({
      id: "FDB-9",
      reviewStatus: "approved",
      showAsPublicCard: true,
      reviewerNotes: "Tampilkan sebagai contoh testimoni publik.",
    });

    expect(validated.errors).toEqual([]);
    expect(validated.data?.reviewStatus).toBe("approved");
    expect(validated.data?.showAsPublicCard).toBe(true);
  });

  it("menolak payload review feedback yang tidak valid", () => {
    const validated = validateDiagnosisFeedbackReview({
      id: "",
      reviewStatus: "invalid",
      showAsPublicCard: "yes",
      reviewerNotes: "x".repeat(501),
    });

    expect(validated.data).toBeNull();
    expect(validated.errors.length).toBeGreaterThan(0);
  });
});
