import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  getKnowledgeBaseRevisionFromData,
  validateKnowledgeBaseData,
  type KnowledgeBaseData,
} from "@/lib/knowledge-base";
import { readAppDocument, writeAppDocument } from "@/lib/app-documents";
import { readSupplementalContentFiles, syncSupplementalContentToSupabase } from "@/lib/expert-supplemental";
import { validateSupplementalContentAgainstKnowledgeBaseData } from "@/lib/supplemental-content";

const knowledgeBasePath = path.join(
  process.cwd(),
  "data",
  "knowledge_base_v2.json"
);
const backupPath = path.join(
  process.cwd(),
  "data",
  "knowledge_base_v2.backup.json"
);
const knowledgeBaseDocumentKey = "knowledge_base_v2";

interface AtomicWriteOptions {
  tempFilePath?: string;
}

export interface SaveKnowledgeBaseFileOptions {
  expectedRevision?: number | null;
  updatedByUsername?: string | null;
  nowIso?: string;
}

export type SaveKnowledgeBaseFileResult =
  | {
      success: true;
      data: KnowledgeBaseData;
    }
  | {
      success: false;
      code: "validation" | "conflict";
      errors: string[];
      currentRevision?: number;
      errorCategories?: {
        knowledgeBase: string[];
        supplementalSync: string[];
        displayReadiness: string[];
      };
    };

export async function readKnowledgeBaseFile() {
  const supabaseDocument = await readAppDocument<KnowledgeBaseData>(
    knowledgeBaseDocumentKey
  );

  if (supabaseDocument) {
    return supabaseDocument;
  }

  const raw = await readFile(knowledgeBasePath, "utf8");
  const parsed = JSON.parse(raw) as KnowledgeBaseData;
  return parsed;
}

export async function saveKnowledgeBaseFile(
  input: unknown,
  options?: SaveKnowledgeBaseFileOptions
): Promise<SaveKnowledgeBaseFileResult> {
  const currentData = await readKnowledgeBaseFile();
  const prepared = prepareKnowledgeBaseDataForSave(currentData, input, options);

  if (!prepared.success) {
    return prepared;
  }

  const currentRaw = await readFile(knowledgeBasePath, "utf8");
  await mkdir(path.dirname(backupPath), { recursive: true });
  await writeTextFileAtomically(backupPath, currentRaw);

  await writeAppDocument(
    knowledgeBaseDocumentKey,
    prepared.data,
    options?.updatedByUsername
  );

  await writeTextFileAtomically(
    knowledgeBasePath,
    `${JSON.stringify(prepared.data, null, 2)}\n`
  );

  const supplementalBundle = await readSupplementalContentFiles();
  await syncSupplementalContentToSupabase(
    supplementalBundle,
    options?.updatedByUsername
  );

  return {
    success: true as const,
    data: prepared.data,
  };
}

export function prepareKnowledgeBaseDataForSave(
  currentData: KnowledgeBaseData,
  input: unknown,
  options?: SaveKnowledgeBaseFileOptions,
  supplementalBundle?: {
    rekomendasi: import("@/lib/supplemental-content").RecommendationEntry[];
    marketplaceProducts: import("@/lib/supplemental-content").MarketplaceProduct[];
    nonChemicalControls: import("@/lib/supplemental-content").NonChemicalControlItem[];
  }
): SaveKnowledgeBaseFileResult {
  const validated = validateKnowledgeBaseData(input);

  if (!validated.data) {
    return {
      success: false,
      code: "validation",
      errors: validated.errors,
      errorCategories: {
        knowledgeBase: validated.errors,
        supplementalSync: [],
        displayReadiness: [],
      },
    };
  }

  const currentRevision = getKnowledgeBaseRevisionFromData(currentData);
  const expectedRevision = options?.expectedRevision;

  if (
    typeof expectedRevision === "number" &&
    Number.isInteger(expectedRevision) &&
    expectedRevision !== currentRevision
  ) {
    return {
      success: false,
      code: "conflict",
      errors: [
        "Knowledge base sudah diperbarui oleh sesi lain. Muat ulang dashboard lalu ulangi penyimpanan.",
      ],
      currentRevision,
    };
  }

  const nextData: KnowledgeBaseData = {
    ...validated.data,
    _meta: {
      ...validated.data._meta,
      revision: currentRevision + 1,
      updatedAt: options?.nowIso ?? new Date().toISOString(),
      updatedBy: options?.updatedByUsername ?? null,
    },
  };
  const normalized = validateKnowledgeBaseData(nextData);

  if (!normalized.data) {
    return {
      success: false,
      code: "validation",
      errors: normalized.errors,
      errorCategories: {
        knowledgeBase: normalized.errors,
        supplementalSync: [],
        displayReadiness: [],
      },
    };
  }

  const supplementalImpact = validateSupplementalContentAgainstKnowledgeBaseData(
    normalized.data,
    supplementalBundle
  );
  const crossFileErrors = [
    ...supplementalImpact.supplementalSyncErrors,
    ...supplementalImpact.displayReadinessErrors,
  ];

  if (crossFileErrors.length > 0) {
    return {
      success: false,
      code: "validation",
      errors: crossFileErrors,
      errorCategories: {
        knowledgeBase: [],
        supplementalSync: supplementalImpact.supplementalSyncErrors,
        displayReadiness: supplementalImpact.displayReadinessErrors,
      },
    };
  }

  return {
    success: true,
    data: normalized.data,
  };
}

export async function writeTextFileAtomically(
  targetPath: string,
  contents: string,
  options?: AtomicWriteOptions
) {
  const directoryPath = path.dirname(targetPath);
  const tempFilePath =
    options?.tempFilePath ??
    path.join(
      directoryPath,
      `${path.basename(targetPath)}.tmp-${process.pid}-${Date.now()}`
    );

  await mkdir(directoryPath, { recursive: true });

  try {
    await writeFile(tempFilePath, contents, "utf8");
    await rename(tempFilePath, targetPath);
  } catch (error) {
    try {
      await unlink(tempFilePath);
    } catch {
      // Ignore cleanup failures so the original write error surfaces.
    }

    throw error;
  }
}

export function getKnowledgeBasePaths() {
  return {
    knowledgeBasePath,
    backupPath,
  };
}
