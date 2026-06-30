import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { DashboardUserRole } from "@/lib/expert-auth";
import {
  readKnowledgeBaseFile,
  saveKnowledgeBaseFile,
} from "@/lib/expert-kb";
import {
  validateKnowledgeBaseData,
  type KnowledgeBaseData,
} from "@/lib/knowledge-base";

export type ChangeRequestStatus = "pending" | "approved" | "rejected" | "applied";

export type ChangeRequestType =
  | "add_gejala"
  | "revise_aturan"
  | "revise_solusi"
  | "revise_pencegahan"
  | "general";

export interface AddGejalaPayload {
  type: "add_gejala";
  gejalaId: string;
  gejalaLabel: string;
  kelompok: string;
}

export interface ReviseAturanPayload {
  type: "revise_aturan";
  penyakitId: string;
  gejalaId: string;
  cf: number;
  ket: string;
}

export interface ReviseSolusiPayload {
  type: "revise_solusi";
  penyakitId: string;
  penanganan: string[];
}

export interface RevisePencegahanPayload {
  type: "revise_pencegahan";
  penyakitId: string;
  pencegahan: string[];
}

export type ChangeRequestStructuredPayload =
  | AddGejalaPayload
  | ReviseAturanPayload
  | ReviseSolusiPayload
  | RevisePencegahanPayload;

export interface ExpertChangeRequestEntry {
  id: string;
  submittedAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  appliedAt: string | null;
  status: ChangeRequestStatus;
  title: string;
  requestType: ChangeRequestType;
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
  structuredPayload: ChangeRequestStructuredPayload | null;
}

export interface ExpertChangeRequestFileData {
  _meta: {
    nama: string;
    versi: string;
    deskripsi: string;
  };
  requests: ExpertChangeRequestEntry[];
}

export interface ExpertChangeRequestInput {
  title?: unknown;
  requestType?: unknown;
  targetPenyakitId?: unknown;
  targetGejalaId?: unknown;
  description?: unknown;
  proposedChange?: unknown;
  structuredPayload?: unknown;
}

export interface ExpertChangeRequestReviewInput {
  id?: unknown;
  status?: unknown;
  reviewerNotes?: unknown;
}

export interface ExpertChangeRequestApplyInput {
  id?: unknown;
}

const changeRequestsPath = path.join(
  process.cwd(),
  "data",
  "expert_change_requests.json"
);

const defaultChangeRequestData: ExpertChangeRequestFileData = {
  _meta: {
    nama: "Usulan Perubahan Pakar SIPADI",
    versi: "2.0.0",
    deskripsi:
      "Antrean usulan perubahan dari pakar sebelum direview admin dan diterapkan ke knowledge base.",
  },
  requests: [],
};

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function roundToTwoDecimals(value: number) {
  return Math.round(value * 100) / 100;
}

function findPenyakitById(data: KnowledgeBaseData, penyakitId: string) {
  return data.penyakit.find((item) => item.id === penyakitId) ?? null;
}

function findGejalaById(data: KnowledgeBaseData, gejalaId: string) {
  return data.gejala.find((item) => item.id === gejalaId) ?? null;
}

function buildApplicationSummary(payload: ChangeRequestStructuredPayload) {
  switch (payload.type) {
    case "add_gejala":
      return `Menambahkan gejala ${payload.gejalaId} (${payload.gejalaLabel}) pada kelompok ${payload.kelompok}.`;
    case "revise_aturan":
      return `Memperbarui aturan ${payload.penyakitId}/${payload.gejalaId} dengan CF ${payload.cf} dan keterangan baru.`;
    case "revise_solusi":
      return `Memperbarui ${payload.penanganan.length} butir penanganan untuk ${payload.penyakitId}.`;
    case "revise_pencegahan":
      return `Memperbarui ${payload.pencegahan.length} butir pencegahan untuk ${payload.penyakitId}.`;
  }
}

function parseStructuredPayload(
  requestType: ChangeRequestType,
  rawPayload: unknown
): {
  data: ChangeRequestStructuredPayload | null;
  errors: string[];
} {
  if (requestType === "general") {
    return {
      data: null,
      errors: [],
    };
  }

  if (!rawPayload || typeof rawPayload !== "object") {
    return {
      data: null,
      errors: ["Payload perubahan terstruktur wajib diisi untuk jenis usulan ini."],
    };
  }

  const payload = rawPayload as Record<string, unknown>;

  if (requestType === "add_gejala") {
    const gejalaId = normalizeString(payload.gejalaId);
    const gejalaLabel = normalizeString(payload.gejalaLabel);
    const kelompok = normalizeString(payload.kelompok);
    const errors: string[] = [];

    if (!gejalaId) {
      errors.push("ID gejala baru wajib diisi.");
    }

    if (!gejalaLabel) {
      errors.push("Label gejala baru wajib diisi.");
    }

    if (!["A", "B", "C", "D", "E"].includes(kelompok)) {
      errors.push("Kelompok gejala baru harus salah satu dari A sampai E.");
    }

    return {
      data:
        errors.length === 0
          ? {
              type: "add_gejala",
              gejalaId,
              gejalaLabel,
              kelompok,
            }
          : null,
      errors,
    };
  }

  if (requestType === "revise_aturan") {
    const penyakitId = normalizeString(payload.penyakitId);
    const gejalaId = normalizeString(payload.gejalaId);
    const cf =
      typeof payload.cf === "number" ? payload.cf : Number(payload.cf ?? Number.NaN);
    const ket = normalizeString(payload.ket);
    const errors: string[] = [];

    if (!penyakitId) {
      errors.push("Target penyakit/hama wajib diisi untuk revisi aturan.");
    }

    if (!gejalaId) {
      errors.push("Target gejala wajib diisi untuk revisi aturan.");
    }

    if (Number.isNaN(cf) || cf < -1 || cf > 1) {
      errors.push("Nilai CF usulan harus berupa angka di antara -1 dan 1.");
    }

    if (!ket) {
      errors.push("Keterangan aturan baru wajib diisi.");
    }

    return {
      data:
        errors.length === 0
          ? {
              type: "revise_aturan",
              penyakitId,
              gejalaId,
              cf: roundToTwoDecimals(cf),
              ket,
            }
          : null,
      errors,
    };
  }

  if (requestType === "revise_solusi") {
    const penyakitId = normalizeString(payload.penyakitId);
    const penanganan = normalizeStringArray(payload.penanganan);
    const errors: string[] = [];

    if (!penyakitId) {
      errors.push("Target penyakit/hama wajib diisi untuk revisi solusi.");
    }

    if (penanganan.length === 0) {
      errors.push("Minimal satu butir penanganan wajib diisi.");
    }

    return {
      data:
        errors.length === 0
          ? {
              type: "revise_solusi",
              penyakitId,
              penanganan,
            }
          : null,
      errors,
    };
  }

  const penyakitId = normalizeString(payload.penyakitId);
  const pencegahan = normalizeStringArray(payload.pencegahan);
  const errors: string[] = [];

  if (!penyakitId) {
    errors.push("Target penyakit/hama wajib diisi untuk revisi pencegahan.");
  }

  if (pencegahan.length === 0) {
    errors.push("Minimal satu butir pencegahan wajib diisi.");
  }

  return {
    data:
      errors.length === 0
        ? {
            type: "revise_pencegahan",
            penyakitId,
            pencegahan,
          }
        : null,
    errors,
  };
}

function validateStructuredPayloadAgainstKnowledgeBase(
  payload: ChangeRequestStructuredPayload | null,
  knowledgeBaseData: KnowledgeBaseData
) {
  const errors: string[] = [];

  if (!payload) {
    return { errors };
  }

  switch (payload.type) {
    case "add_gejala":
      if (findGejalaById(knowledgeBaseData, payload.gejalaId)) {
        errors.push(`Gejala ${payload.gejalaId} sudah ada di knowledge base.`);
      }
      break;
    case "revise_aturan":
      if (!findPenyakitById(knowledgeBaseData, payload.penyakitId)) {
        errors.push(
          `Target penyakit/hama ${payload.penyakitId} tidak ditemukan di knowledge base.`
        );
      }

      if (!findGejalaById(knowledgeBaseData, payload.gejalaId)) {
        errors.push(
          `Target gejala ${payload.gejalaId} tidak ditemukan di knowledge base.`
        );
      }
      break;
    case "revise_solusi":
    case "revise_pencegahan":
      if (!findPenyakitById(knowledgeBaseData, payload.penyakitId)) {
        errors.push(
          `Target penyakit/hama ${payload.penyakitId} tidak ditemukan di knowledge base.`
        );
      }
      break;
  }

  return { errors };
}

function normalizeEntry(
  entry: Partial<ExpertChangeRequestEntry>
): ExpertChangeRequestEntry {
  return {
    id: normalizeString(entry.id),
    submittedAt: normalizeString(entry.submittedAt),
    updatedAt: normalizeString(entry.updatedAt),
    reviewedAt:
      typeof entry.reviewedAt === "string" && entry.reviewedAt.trim()
        ? entry.reviewedAt
        : null,
    appliedAt:
      typeof entry.appliedAt === "string" && entry.appliedAt.trim()
        ? entry.appliedAt
        : null,
    status:
      entry.status === "approved" ||
      entry.status === "rejected" ||
      entry.status === "applied"
        ? entry.status
        : "pending",
    title: normalizeString(entry.title),
    requestType:
      entry.requestType === "add_gejala" ||
      entry.requestType === "revise_aturan" ||
      entry.requestType === "revise_solusi" ||
      entry.requestType === "revise_pencegahan"
        ? entry.requestType
        : "general",
    targetPenyakitId: normalizeString(entry.targetPenyakitId),
    targetGejalaId: normalizeString(entry.targetGejalaId),
    description: normalizeString(entry.description),
    proposedChange: normalizeString(entry.proposedChange),
    reviewerNotes: normalizeString(entry.reviewerNotes),
    applicationSummary: normalizeString(entry.applicationSummary),
    submittedByUsername: normalizeString(entry.submittedByUsername) || "unknown",
    submittedByRole: entry.submittedByRole === "admin" ? "admin" : "pakar",
    reviewedByUsername: normalizeString(entry.reviewedByUsername) || null,
    appliedByUsername: normalizeString(entry.appliedByUsername) || null,
    structuredPayload:
      entry.structuredPayload && typeof entry.structuredPayload === "object"
        ? (entry.structuredPayload as ChangeRequestStructuredPayload)
        : null,
  };
}

export function validateExpertChangeRequest(input: ExpertChangeRequestInput): {
  data: Omit<
    ExpertChangeRequestEntry,
    | "id"
    | "submittedAt"
    | "updatedAt"
    | "reviewedAt"
    | "appliedAt"
    | "status"
    | "reviewerNotes"
    | "applicationSummary"
    | "submittedByUsername"
    | "submittedByRole"
    | "reviewedByUsername"
    | "appliedByUsername"
  > | null;
  errors: string[];
} {
  const errors: string[] = [];
  const title = normalizeString(input.title);
  const requestType = normalizeString(input.requestType);
  const targetPenyakitId = normalizeString(input.targetPenyakitId);
  const targetGejalaId = normalizeString(input.targetGejalaId);
  const description = normalizeString(input.description);
  const proposedChange = normalizeString(input.proposedChange);

  if (!title) {
    errors.push("Judul usulan perubahan wajib diisi.");
  }

  if (
    requestType !== "add_gejala" &&
    requestType !== "revise_aturan" &&
    requestType !== "revise_solusi" &&
    requestType !== "revise_pencegahan" &&
    requestType !== "general"
  ) {
    errors.push("Jenis usulan perubahan tidak valid.");
  }

  if (!description) {
    errors.push("Alasan usulan perubahan wajib diisi.");
  }

  if (!proposedChange) {
    errors.push("Ringkasan perubahan yang diajukan wajib diisi.");
  }

  if (errors.length > 0) {
    return { data: null, errors };
  }

  const parsedPayload = parseStructuredPayload(
    requestType as ChangeRequestType,
    input.structuredPayload
  );
  errors.push(...parsedPayload.errors);

  if (errors.length > 0) {
    return { data: null, errors };
  }

  return {
    data: {
      title,
      requestType: requestType as ChangeRequestType,
      targetPenyakitId:
        parsedPayload.data?.type === "revise_aturan" ||
        parsedPayload.data?.type === "revise_solusi" ||
        parsedPayload.data?.type === "revise_pencegahan"
          ? parsedPayload.data.penyakitId
          : targetPenyakitId,
      targetGejalaId:
        parsedPayload.data?.type === "add_gejala"
          ? parsedPayload.data.gejalaId
          : parsedPayload.data?.type === "revise_aturan"
            ? parsedPayload.data.gejalaId
            : targetGejalaId,
      description,
      proposedChange,
      structuredPayload: parsedPayload.data,
    },
    errors,
  };
}

export function validateExpertChangeRequestReview(
  input: ExpertChangeRequestReviewInput
): {
  data: {
    id: string;
    status: Exclude<ChangeRequestStatus, "applied">;
    reviewerNotes: string;
  } | null;
  errors: string[];
} {
  const errors: string[] = [];
  const id = normalizeString(input.id);
  const status = normalizeString(input.status);
  const reviewerNotes = normalizeString(input.reviewerNotes);

  if (!id) {
    errors.push("ID usulan perubahan wajib dikirim.");
  }

  if (status !== "pending" && status !== "approved" && status !== "rejected") {
    errors.push("Status review usulan perubahan tidak valid.");
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
      status: status as Exclude<ChangeRequestStatus, "applied">,
      reviewerNotes,
    },
    errors,
  };
}

export function validateExpertChangeRequestApply(
  input: ExpertChangeRequestApplyInput
) {
  const errors: string[] = [];
  const id = normalizeString(input.id);

  if (!id) {
    errors.push("ID usulan perubahan wajib dikirim.");
  }

  return {
    data: errors.length === 0 ? { id } : null,
    errors,
  };
}

async function ensureChangeRequestsFile() {
  try {
    await readFile(changeRequestsPath, "utf8");
  } catch {
    await mkdir(path.dirname(changeRequestsPath), { recursive: true });
    await writeFile(
      changeRequestsPath,
      `${JSON.stringify(defaultChangeRequestData, null, 2)}\n`,
      "utf8"
    );
  }
}

async function writeChangeRequestsFile(data: ExpertChangeRequestFileData) {
  await writeFile(changeRequestsPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function readExpertChangeRequestsFile() {
  await ensureChangeRequestsFile();
  const raw = await readFile(changeRequestsPath, "utf8");
  const parsed = JSON.parse(raw) as Partial<ExpertChangeRequestFileData>;

  return {
    _meta: parsed._meta ?? defaultChangeRequestData._meta,
    requests: Array.isArray(parsed.requests)
      ? parsed.requests.map((entry) => normalizeEntry(entry))
      : [],
  } satisfies ExpertChangeRequestFileData;
}

export async function saveExpertChangeRequest(
  input: ExpertChangeRequestInput,
  author: {
    username: string;
    role: DashboardUserRole;
  }
) {
  const validated = validateExpertChangeRequest(input);

  if (!validated.data) {
    return {
      success: false as const,
      errors: validated.errors,
    };
  }

  const knowledgeBaseData = await readKnowledgeBaseFile();
  const integrityCheck = validateStructuredPayloadAgainstKnowledgeBase(
    validated.data.structuredPayload,
    knowledgeBaseData
  );

  if (integrityCheck.errors.length > 0) {
    return {
      success: false as const,
      errors: integrityCheck.errors,
    };
  }

  const currentData = await readExpertChangeRequestsFile();
  const now = new Date().toISOString();
  const nextEntry: ExpertChangeRequestEntry = {
    id: `CRQ-${Date.now()}`,
    submittedAt: now,
    updatedAt: now,
    reviewedAt: null,
    appliedAt: null,
    status: "pending",
    reviewerNotes: "",
    applicationSummary: "",
    submittedByUsername: author.username,
    submittedByRole: author.role,
    reviewedByUsername: null,
    appliedByUsername: null,
    ...validated.data,
  };

  const nextData: ExpertChangeRequestFileData = {
    ...currentData,
    requests: [nextEntry, ...currentData.requests],
  };

  await writeChangeRequestsFile(nextData);

  return {
    success: true as const,
    data: nextEntry,
  };
}

export async function reviewExpertChangeRequest(
  input: ExpertChangeRequestReviewInput,
  reviewerUsername: string
) {
  const validated = validateExpertChangeRequestReview(input);

  if (!validated.data) {
    return {
      success: false as const,
      errors: validated.errors,
    };
  }

  const reviewData = validated.data;
  const currentData = await readExpertChangeRequestsFile();
  const requestIndex = currentData.requests.findIndex(
    (entry) => entry.id === reviewData.id
  );

  if (requestIndex < 0) {
    return {
      success: false as const,
      errors: ["Usulan perubahan tidak ditemukan."],
    };
  }

  const currentEntry = currentData.requests[requestIndex];

  if (currentEntry.status === "applied") {
    return {
      success: false as const,
      errors: ["Usulan yang sudah diterapkan tidak dapat direview ulang."],
    };
  }

  const updatedEntry: ExpertChangeRequestEntry = {
    ...currentEntry,
    status: reviewData.status,
    reviewerNotes: reviewData.reviewerNotes,
    reviewedAt: new Date().toISOString(),
    reviewedByUsername: reviewerUsername,
    updatedAt: new Date().toISOString(),
  };

  const nextRequests = [...currentData.requests];
  nextRequests[requestIndex] = updatedEntry;

  await writeChangeRequestsFile({
    ...currentData,
    requests: nextRequests,
  });

  return {
    success: true as const,
    data: updatedEntry,
  };
}

export function applyChangeRequestToKnowledgeBaseData(
  knowledgeBaseData: KnowledgeBaseData,
  request: ExpertChangeRequestEntry
) {
  if (request.status !== "approved") {
    return {
      success: false as const,
      errors: ["Hanya usulan berstatus approved yang dapat diterapkan."],
    };
  }

  if (!request.structuredPayload) {
    return {
      success: false as const,
      errors: ["Usulan ini tidak memiliki payload terstruktur untuk diterapkan."],
    };
  }

  const integrityCheck = validateStructuredPayloadAgainstKnowledgeBase(
    request.structuredPayload,
    knowledgeBaseData
  );

  if (integrityCheck.errors.length > 0) {
    return {
      success: false as const,
      errors: integrityCheck.errors,
    };
  }

  const nextData = structuredClone(knowledgeBaseData);
  const payload = request.structuredPayload;

  switch (payload.type) {
    case "add_gejala":
      nextData.gejala.push({
        id: payload.gejalaId,
        label: payload.gejalaLabel,
        kelompok: payload.kelompok,
      });
      break;
    case "revise_aturan": {
      const penyakit = findPenyakitById(nextData, payload.penyakitId);

      if (!penyakit) {
        return {
          success: false as const,
          errors: [`Target penyakit/hama ${payload.penyakitId} tidak ditemukan.`],
        };
      }

      const ruleIndex = penyakit.aturan.findIndex(
        (rule) => rule.gejala_id === payload.gejalaId
      );

      if (ruleIndex >= 0) {
        penyakit.aturan[ruleIndex] = {
          ...penyakit.aturan[ruleIndex],
          cf: payload.cf,
          ket: payload.ket,
        };
      } else {
        penyakit.aturan.push({
          gejala_id: payload.gejalaId,
          cf: payload.cf,
          ket: payload.ket,
        });
      }
      break;
    }
    case "revise_solusi": {
      const penyakit = findPenyakitById(nextData, payload.penyakitId);

      if (!penyakit) {
        return {
          success: false as const,
          errors: [`Target penyakit/hama ${payload.penyakitId} tidak ditemukan.`],
        };
      }

      penyakit.solusi = {
        penanganan: payload.penanganan,
        pencegahan: penyakit.solusi?.pencegahan ?? [],
      };
      break;
    }
    case "revise_pencegahan": {
      const penyakit = findPenyakitById(nextData, payload.penyakitId);

      if (!penyakit) {
        return {
          success: false as const,
          errors: [`Target penyakit/hama ${payload.penyakitId} tidak ditemukan.`],
        };
      }

      penyakit.solusi = {
        penanganan: penyakit.solusi?.penanganan ?? [],
        pencegahan: payload.pencegahan,
      };
      break;
    }
  }

  const validated = validateKnowledgeBaseData(nextData);

  if (!validated.data) {
    return {
      success: false as const,
      errors: validated.errors,
    };
  }

  return {
    success: true as const,
    data: validated.data,
    applicationSummary: buildApplicationSummary(payload),
  };
}

export async function applyApprovedExpertChangeRequest(
  input: ExpertChangeRequestApplyInput,
  appliedByUsername: string
) {
  const validated = validateExpertChangeRequestApply(input);

  if (!validated.data) {
    return {
      success: false as const,
      errors: validated.errors,
    };
  }

  const applyData = validated.data;

  const currentData = await readExpertChangeRequestsFile();
  const requestIndex = currentData.requests.findIndex(
    (entry) => entry.id === applyData.id
  );

  if (requestIndex < 0) {
    return {
      success: false as const,
      errors: ["Usulan perubahan tidak ditemukan."],
    };
  }

  const currentEntry = currentData.requests[requestIndex];

  if (currentEntry.status === "applied") {
    return {
      success: false as const,
      errors: ["Usulan perubahan ini sudah pernah diterapkan."],
    };
  }

  const knowledgeBaseData = await readKnowledgeBaseFile();
  const appliedResult = applyChangeRequestToKnowledgeBaseData(
    knowledgeBaseData,
    currentEntry
  );

  if (!appliedResult.success) {
    return appliedResult;
  }

  const saveResult = await saveKnowledgeBaseFile(appliedResult.data);

  if (!saveResult.success) {
    return saveResult;
  }

  const now = new Date().toISOString();
  const updatedEntry: ExpertChangeRequestEntry = {
    ...currentEntry,
    status: "applied",
    appliedAt: now,
    appliedByUsername,
    updatedAt: now,
    applicationSummary: appliedResult.applicationSummary,
  };

  const nextRequests = [...currentData.requests];
  nextRequests[requestIndex] = updatedEntry;

  await writeChangeRequestsFile({
    ...currentData,
    requests: nextRequests,
  });

  return {
    success: true as const,
    data: updatedEntry,
    knowledgeBaseData: saveResult.data,
    applicationSummary: appliedResult.applicationSummary,
  };
}

export function getExpertChangeRequestsPath() {
  return changeRequestsPath;
}
