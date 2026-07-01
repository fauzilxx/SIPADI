import type { KnowledgeBaseData } from "@/lib/knowledge-base";

import type {
  ChangeRequestEntry,
  GejalaProposalDraft,
  GejalaRelationDraft,
  SaveErrorCategories,
  SaveErrorCategoryKey,
} from "@/components/pakar-dashboard/types";

export function formatDateLabel(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  return `${date.toLocaleDateString("id-ID")} ${date.toLocaleTimeString(
    "id-ID",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  )}`;
}

export function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function createEmptyRelationRules(
  penyakitList: { id: string }[]
): Record<string, GejalaRelationDraft> {
  return Object.fromEntries(
    penyakitList.map((penyakit) => [
      penyakit.id,
      {
        cf: "0",
        ket: "",
      },
    ])
  );
}

export function syncRelationRulesWithPenyakit(
  relationRules: Record<string, GejalaRelationDraft>,
  penyakitList: { id: string }[]
) {
  return Object.fromEntries(
    penyakitList.map((penyakit) => [
      penyakit.id,
      relationRules[penyakit.id] ?? {
        cf: "0",
        ket: "",
      },
    ])
  );
}

export function createGejalaDraft(gejala: {
  id: string;
  label: string;
  kelompok: string;
}): GejalaProposalDraft {
  return {
    id: gejala.id,
    label: gejala.label,
    kelompok: gejala.kelompok,
    relationRules: {},
  };
}

export function createGejalaDraftMap(
  gejalaList: { id: string; label: string; kelompok: string }[]
) {
  return Object.fromEntries(
    gejalaList.map((gejala) => [gejala.id, createGejalaDraft(gejala)])
  );
}

export function createEmptyGejalaDraft(
  nextId = "",
  penyakitList: { id: string }[] = []
): GejalaProposalDraft {
  return {
    id: nextId,
    label: "",
    kelompok: "A",
    relationRules: createEmptyRelationRules(penyakitList),
  };
}

export function extractGejalaSequence(id: string) {
  const match = /^G(\d+)$/i.exec(id.trim());
  return match ? Number(match[1]) : null;
}

export function formatGejalaId(sequence: number) {
  return `G${String(sequence).padStart(2, "0")}`;
}

export function getSuggestedNextGejalaId(
  knowledgeBaseData: KnowledgeBaseData,
  requests: ChangeRequestEntry[]
) {
  const baseSequence =
    knowledgeBaseData.gejala.reduce((currentMax, gejala) => {
      const sequence = extractGejalaSequence(gejala.id);
      return sequence && sequence > currentMax ? sequence : currentMax;
    }, 0) + 1;

  const nextSequence = requests.reduce((currentMax, request) => {
    if (
      request.requestType !== "upsert_gejala" ||
      request.structuredPayload?.type !== "upsert_gejala" ||
      request.structuredPayload.mode !== "create" ||
      (request.status !== "pending" && request.status !== "approved")
    ) {
      return currentMax;
    }

    const sequence = extractGejalaSequence(request.structuredPayload.gejala.id);
    return sequence && sequence >= currentMax ? sequence + 1 : currentMax;
  }, baseSequence);

  return formatGejalaId(nextSequence);
}

export function normalizeSaveErrorCategories(
  value: unknown
): SaveErrorCategories | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<Record<SaveErrorCategoryKey, unknown>>;
  const knowledgeBase = Array.isArray(candidate.knowledgeBase)
    ? candidate.knowledgeBase.filter(
        (item): item is string => typeof item === "string"
      )
    : [];
  const supplementalSync = Array.isArray(candidate.supplementalSync)
    ? candidate.supplementalSync.filter(
        (item): item is string => typeof item === "string"
      )
    : [];
  const displayReadiness = Array.isArray(candidate.displayReadiness)
    ? candidate.displayReadiness.filter(
        (item): item is string => typeof item === "string"
      )
    : [];

  if (
    knowledgeBase.length === 0 &&
    supplementalSync.length === 0 &&
    displayReadiness.length === 0
  ) {
    return null;
  }

  return {
    knowledgeBase,
    supplementalSync,
    displayReadiness,
  };
}
