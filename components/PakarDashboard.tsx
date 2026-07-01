"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import CfTab from "@/components/pakar-dashboard/CfTab";
import ChangeRequestsTab from "@/components/pakar-dashboard/ChangeRequestsTab";
import DashboardHeader from "@/components/pakar-dashboard/DashboardHeader";
import FeedbackTab from "@/components/pakar-dashboard/FeedbackTab";
import GejalaTab from "@/components/pakar-dashboard/GejalaTab";
import {
  createEmptyGejalaDraft,
  createGejalaDraftMap,
  createGejalaDraft,
  getSuggestedNextGejalaId,
  normalizeSaveErrorCategories,
  splitLines,
  syncRelationRulesWithPenyakit,
} from "@/components/pakar-dashboard/helpers";
import OverviewTab from "@/components/pakar-dashboard/OverviewTab";
import PenyakitTab from "@/components/pakar-dashboard/PenyakitTab";
import {
  saveErrorCategoryMeta,
  tabs,
  type ChangeRequestEntry,
  type ChangeRequestFormState,
  type FeedbackEntry,
  type FeedbackSummary,
  type GejalaProposalDraft,
  type SaveErrorCategoryKey,
  type SaveState,
  type TabKey,
} from "@/components/pakar-dashboard/types";
import { canDirectEditDashboardField } from "@/lib/dashboard-edit-policy";
import type { DashboardUserRole } from "@/lib/expert-auth";
import {
  validateKnowledgeBaseData,
  type KnowledgeBaseData,
} from "@/lib/knowledge-base";

export default function PakarDashboard({
  initialData,
  currentUserRole,
  currentUsername,
}: {
  initialData: KnowledgeBaseData;
  currentUserRole: DashboardUserRole;
  currentUsername: string;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [workingData, setWorkingData] = useState<KnowledgeBaseData>(initialData);
  const [saveState, setSaveState] = useState<SaveState>({
    type: "idle",
    message: "",
  });
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [feedbackEntries, setFeedbackEntries] = useState<FeedbackEntry[]>([]);
  const [feedbackSummary, setFeedbackSummary] = useState<FeedbackSummary | null>(
    null
  );
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackState, setFeedbackState] = useState<SaveState>({
    type: "idle",
    message: "",
  });
  const [feedbackNotes, setFeedbackNotes] = useState<Record<string, string>>({});
  const [feedbackStatusDraft, setFeedbackStatusDraft] = useState<
    Record<string, FeedbackEntry["reviewStatus"]>
  >({});
  const [feedbackPublicDraft, setFeedbackPublicDraft] = useState<
    Record<string, boolean>
  >({});
  const [updatingFeedbackId, setUpdatingFeedbackId] = useState<string | null>(
    null
  );

  const [changeRequests, setChangeRequests] = useState<ChangeRequestEntry[]>([]);
  const [changeRequestLoading, setChangeRequestLoading] = useState(true);
  const [changeRequestState, setChangeRequestState] = useState<SaveState>({
    type: "idle",
    message: "",
  });
  const [changeRequestForm, setChangeRequestForm] =
    useState<ChangeRequestFormState>({
      title: "",
      requestType: "general",
      targetPenyakitId: "",
      targetGejalaId: "",
      description: "",
      proposedChange: "",
      proposedKelompok: "A",
      proposedGejalaLabel: "",
      proposedCf: "0.6",
      proposedKet: "",
      proposedPenanganan: "",
      proposedPencegahan: "",
    });
  const [gejalaProposalDrafts, setGejalaProposalDrafts] = useState<
    Record<string, GejalaProposalDraft>
  >(() => createGejalaDraftMap(initialData.gejala));
  const [newGejalaDraft, setNewGejalaDraft] = useState<GejalaProposalDraft>(() =>
    createEmptyGejalaDraft(
      getSuggestedNextGejalaId(initialData, []),
      initialData.penyakit
    )
  );
  const [submittingGejalaProposalId, setSubmittingGejalaProposalId] = useState<
    string | null
  >(null);
  const [changeRequestNotes, setChangeRequestNotes] = useState<
    Record<string, string>
  >({});
  const [changeRequestStatusDraft, setChangeRequestStatusDraft] = useState<
    Record<string, ChangeRequestEntry["status"]>
  >({});
  const [savingChangeRequest, setSavingChangeRequest] = useState(false);
  const [updatingChangeRequestId, setUpdatingChangeRequestId] = useState<
    string | null
  >(null);
  const [applyingChangeRequestId, setApplyingChangeRequestId] = useState<
    string | null
  >(null);

  const isAdmin = currentUserRole === "admin";
  const canCreateGejalaDirectly = canDirectEditDashboardField("createGejala");
  const canCreatePenyakitDirectly =
    canDirectEditDashboardField("createPenyakit");
  const loadedRevision =
    typeof initialData._meta.revision === "number" &&
    Number.isInteger(initialData._meta.revision) &&
    initialData._meta.revision >= 0
      ? initialData._meta.revision
      : 0;

  const dirty = JSON.stringify(workingData) !== JSON.stringify(initialData);
  const validation = useMemo(
    () => validateKnowledgeBaseData(workingData),
    [workingData]
  );

  const visibleChangeRequests = useMemo(
    () =>
      changeRequests.filter((request) =>
        isAdmin
          ? request.submittedByRole === "pakar"
          : request.submittedByUsername === currentUsername
      ),
    [changeRequests, currentUsername, isAdmin]
  );
  const publicFeedbackCards = useMemo(
    () =>
      feedbackEntries.filter(
        (entry) => entry.reviewStatus === "approved" && entry.showAsPublicCard
      ),
    [feedbackEntries]
  );
  const visibleTabs = useMemo(
    () =>
      tabs.filter((tab) => {
        if (isAdmin) {
          return true;
        }

        return (
          tab.id === "overview" || tab.id === "usulan" || tab.id === "gejala"
        );
      }),
    [isAdmin]
  );
  const categorizedSaveErrors = useMemo(() => {
    if (!saveState.errorCategories) {
      return [];
    }

    return (Object.keys(saveErrorCategoryMeta) as SaveErrorCategoryKey[])
      .map((key) => ({
        key,
        ...saveErrorCategoryMeta[key],
        errors: saveState.errorCategories?.[key] ?? [],
      }))
      .filter((category) => category.errors.length > 0);
  }, [saveState.errorCategories]);
  const uncategorizedSaveErrors = useMemo(() => {
    if (!saveState.errors || !saveState.errorCategories) {
      return saveState.errors ?? [];
    }

    const categorized = new Set(
      Object.values(saveState.errorCategories).flatMap((items) => items)
    );

    return saveState.errors.filter((error) => !categorized.has(error));
  }, [saveState.errorCategories, saveState.errors]);
  const suggestedNextGejalaId = useMemo(
    () => getSuggestedNextGejalaId(workingData, changeRequests),
    [changeRequests, workingData]
  );
  const resolvedActiveTab = visibleTabs.some((tab) => tab.id === activeTab)
    ? activeTab
    : "overview";
  const resolvedNewGejalaDraft = useMemo(
    () => ({
      ...newGejalaDraft,
      id: suggestedNextGejalaId,
      relationRules: syncRelationRulesWithPenyakit(
        newGejalaDraft.relationRules,
        workingData.penyakit
      ),
    }),
    [newGejalaDraft, suggestedNextGejalaId, workingData.penyakit]
  );

  useEffect(() => {
    async function loadFeedback() {
      if (!isAdmin) {
        setFeedbackLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/pakar/feedback");
        const payload = (await response.json()) as {
          success: boolean;
          message?: string;
          feedback?: FeedbackEntry[];
          summary?: FeedbackSummary;
        };

        if (!response.ok || !payload.success) {
          setFeedbackState({
            type: "error",
            message: payload.message ?? "Gagal memuat feedback petani.",
          });
          setFeedbackLoading(false);
          return;
        }

        const items = payload.feedback ?? [];
        setFeedbackEntries(items);
        setFeedbackSummary(payload.summary ?? null);
        setFeedbackNotes(
          Object.fromEntries(items.map((item) => [item.id, item.reviewerNotes]))
        );
        setFeedbackStatusDraft(
          Object.fromEntries(items.map((item) => [item.id, item.reviewStatus]))
        );
        setFeedbackPublicDraft(
          Object.fromEntries(items.map((item) => [item.id, item.showAsPublicCard]))
        );
        setFeedbackLoading(false);
      } catch {
        setFeedbackState({
          type: "error",
          message: "Tidak dapat terhubung ke API feedback petani.",
        });
        setFeedbackLoading(false);
      }
    }

    async function loadChangeRequests() {
      try {
        const response = await fetch("/api/pakar/change-requests");
        const payload = (await response.json()) as {
          success: boolean;
          message?: string;
          requests?: ChangeRequestEntry[];
        };

        if (!response.ok || !payload.success) {
          setChangeRequestState({
            type: "error",
            message: payload.message ?? "Gagal memuat usulan perubahan pakar.",
          });
          setChangeRequestLoading(false);
          return;
        }

        const items = payload.requests ?? [];
        setChangeRequests(items);
        setChangeRequestNotes(
          Object.fromEntries(items.map((item) => [item.id, item.reviewerNotes]))
        );
        setChangeRequestStatusDraft(
          Object.fromEntries(items.map((item) => [item.id, item.status]))
        );
        setChangeRequestLoading(false);
      } catch {
        setChangeRequestState({
          type: "error",
          message: "Tidak dapat terhubung ke API usulan perubahan.",
        });
        setChangeRequestLoading(false);
      }
    }

    loadFeedback();
    loadChangeRequests();
  }, [isAdmin]);

  function buildChangeRequestStructuredPayload() {
    switch (changeRequestForm.requestType) {
      case "add_gejala":
        return {
          type: "add_gejala" as const,
          gejalaId: changeRequestForm.targetGejalaId.trim(),
          gejalaLabel: changeRequestForm.proposedGejalaLabel.trim(),
          kelompok: changeRequestForm.proposedKelompok,
        };
      case "revise_aturan":
        return {
          type: "revise_aturan" as const,
          penyakitId: changeRequestForm.targetPenyakitId.trim(),
          gejalaId: changeRequestForm.targetGejalaId.trim(),
          cf: Number(changeRequestForm.proposedCf),
          ket: changeRequestForm.proposedKet.trim(),
        };
      case "revise_solusi":
        return {
          type: "revise_solusi" as const,
          penyakitId: changeRequestForm.targetPenyakitId.trim(),
          penanganan: splitLines(changeRequestForm.proposedPenanganan),
        };
      case "revise_pencegahan":
        return {
          type: "revise_pencegahan" as const,
          penyakitId: changeRequestForm.targetPenyakitId.trim(),
          pencegahan: splitLines(changeRequestForm.proposedPencegahan),
        };
      case "general":
      default:
        return null;
    }
  }

  function resetChangeRequestForm() {
    setChangeRequestForm({
      title: "",
      requestType: "general",
      targetPenyakitId: "",
      targetGejalaId: "",
      description: "",
      proposedChange: "",
      proposedKelompok: "A",
      proposedGejalaLabel: "",
      proposedCf: "0.6",
      proposedKet: "",
      proposedPenanganan: "",
      proposedPencegahan: "",
    });
  }

  function buildGejalaProposalRequest(
    gejala: GejalaProposalDraft,
    mode: "create" | "update",
    previousValue?: {
      id: string;
      label: string;
      kelompok: string;
    } | null
  ) {
    const normalizedId = gejala.id.trim().toUpperCase();
    const normalizedLabel = gejala.label.trim();
    const normalizedKelompok = gejala.kelompok;
    const displayId =
      mode === "create" ? suggestedNextGejalaId : normalizedId || "(tanpa ID)";
    const relationRules =
      mode === "create"
        ? workingData.penyakit.map((penyakit) => {
            const draftRule = gejala.relationRules[penyakit.id];
            const normalizedCf = draftRule?.cf.trim() ? Number(draftRule.cf) : 0;

            return {
              penyakitId: penyakit.id,
              cf: Number.isNaN(normalizedCf) ? 0 : normalizedCf,
              ket: draftRule?.ket.trim() ?? "",
            };
          })
        : [];
    const nonZeroRelations = relationRules.filter(
      (relationRule) => relationRule.cf !== 0
    );
    const firstNonZeroRelation = nonZeroRelations[0] ?? relationRules[0] ?? null;

    return {
      title:
        mode === "create"
          ? `Usulan gejala baru ${displayId}`
          : `Usulan revisi gejala ${displayId}`,
      requestType: "upsert_gejala" as const,
      targetPenyakitId:
        mode === "create" ? firstNonZeroRelation?.penyakitId ?? "" : "",
      targetGejalaId: normalizedId,
      description:
        mode === "create"
          ? "Pakar menambahkan gejala baru dengan format final knowledge base sekaligus matriks relasi ke beberapa penyakit/hama target."
          : "Pakar mengusulkan pembaruan gejala existing dengan format final knowledge base.",
      proposedChange:
        mode === "create"
          ? `Tambahkan gejala ${displayId} dengan label "${normalizedLabel}" pada kelompok ${normalizedKelompok}. Relasi non-zero diajukan ke ${nonZeroRelations.length} penyakit/hama dan penyakit yang tidak diisi akan disimpan dengan CF 0. ID final akan diamankan ulang saat admin menerapkan usulan.`
          : `Perbarui gejala ${normalizedId} menjadi label "${normalizedLabel}" pada kelompok ${normalizedKelompok}.`,
      structuredPayload: {
        type: "upsert_gejala" as const,
        mode,
        gejala: {
          id: normalizedId,
          label: normalizedLabel,
          kelompok: normalizedKelompok,
        },
        relationRules: mode === "create" ? relationRules : null,
        previousValue: previousValue
          ? {
              id: previousValue.id,
              label: previousValue.label,
              kelompok: previousValue.kelompok,
            }
          : null,
      },
    };
  }

  async function submitChangeRequest(
    payload: Record<string, unknown>,
    options?: {
      onSuccess?: (request: ChangeRequestEntry) => void;
      successMessage?: string;
    }
  ) {
    const response = await fetch("/api/pakar/change-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const body = (await response.json()) as {
      success: boolean;
      message?: string;
      request?: ChangeRequestEntry;
      errors?: string[];
    };

    if (!response.ok || !body.success || !body.request) {
      throw new Error(
        body.errors?.join(" ") ??
          body.message ??
          "Usulan perubahan belum bisa disimpan."
      );
    }

    setChangeRequests((current) => [body.request!, ...current]);
    setChangeRequestNotes((current) => ({
      ...current,
      [body.request!.id]: body.request!.reviewerNotes,
    }));
    setChangeRequestStatusDraft((current) => ({
      ...current,
      [body.request!.id]: body.request!.status,
    }));
    setChangeRequestState({
      type: "success",
      message:
        options?.successMessage ??
        body.message ??
        "Usulan perubahan berhasil disimpan.",
    });
    options?.onSuccess?.(body.request);
  }

  function updateMeta(field: string, value: string) {
    setWorkingData((current) => ({
      ...current,
      _meta: {
        ...current._meta,
        [field]: value,
      },
    }));
  }

  function updateThreshold(value: number) {
    setWorkingData((current) => ({
      ...current,
      cf_formula: {
        ...current.cf_formula,
        threshold_tampil: value,
      },
    }));
  }

  function updateChangeRequestFormField<K extends keyof ChangeRequestFormState>(
    field: K,
    value: ChangeRequestFormState[K]
  ) {
    setChangeRequestForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateGejalaProposalDraft(
    gejalaId: string,
    field: "id" | "label" | "kelompok",
    value: string
  ) {
    setGejalaProposalDrafts((current) => ({
      ...current,
      [gejalaId]: {
        ...(current[gejalaId] ??
          createEmptyGejalaDraft(gejalaId, workingData.penyakit)),
        [field]: value,
      },
    }));
  }

  function updateNewGejalaDraft(
    field: "id" | "label" | "kelompok",
    value: string
  ) {
    setNewGejalaDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateNewGejalaRelationRule(
    penyakitId: string,
    field: "cf" | "ket",
    value: string
  ) {
    setNewGejalaDraft((current) => ({
      ...current,
      relationRules: {
        ...current.relationRules,
        [penyakitId]: {
          ...(current.relationRules[penyakitId] ?? {
            cf: "0",
            ket: "",
          }),
          [field]: value,
        },
      },
    }));
  }

  function hasGejalaDraftChanges(gejalaId: string) {
    const currentDraft = gejalaProposalDrafts[gejalaId];
    const source = workingData.gejala.find((item) => item.id === gejalaId);

    if (!currentDraft || !source) {
      return false;
    }

    return (
      currentDraft.id.trim().toUpperCase() !== source.id ||
      currentDraft.label.trim() !== source.label ||
      currentDraft.kelompok !== source.kelompok
    );
  }

  function isNewGejalaDraftReady() {
    return (
      resolvedNewGejalaDraft.label.trim().length > 0 &&
      resolvedNewGejalaDraft.kelompok.trim().length > 0 &&
      workingData.penyakit.every((penyakit) => {
        const cfValue =
          resolvedNewGejalaDraft.relationRules[penyakit.id]?.cf.trim() ?? "0";
        const parsedCf = cfValue ? Number(cfValue) : 0;

        return !Number.isNaN(parsedCf) && parsedCf >= -1 && parsedCf <= 1;
      })
    );
  }

  function updateGejala(
    index: number,
    field: "id" | "label" | "kelompok",
    value: string
  ) {
    setWorkingData((current) => {
      const gejala = [...current.gejala];
      const previousGejalaId = gejala[index]?.id ?? "";
      gejala[index] = {
        ...gejala[index],
        [field]: field === "id" ? value.toUpperCase() : value,
      };

      const penyakit =
        field === "id" && previousGejalaId && previousGejalaId !== value.toUpperCase()
          ? current.penyakit.map((item) => ({
              ...item,
              aturan: item.aturan.map((rule) =>
                rule.gejala_id === previousGejalaId
                  ? {
                      ...rule,
                      gejala_id: value.toUpperCase(),
                    }
                  : rule
              ),
            }))
          : current.penyakit;

      setGejalaProposalDrafts(createGejalaDraftMap(gejala));
      return { ...current, gejala, penyakit };
    });
  }

  function addGejala() {
    setWorkingData((current) => {
      const gejala = [
        ...current.gejala,
        {
          id: `G${String(current.gejala.length + 1).padStart(2, "0")}`,
          label: "Gejala baru",
          kelompok: "A",
        },
      ];

      setGejalaProposalDrafts(createGejalaDraftMap(gejala));
      return {
        ...current,
        gejala,
      };
    });
  }

  function deleteGejala(index: number) {
    setWorkingData((current) => {
      const targetGejala = current.gejala[index];

      if (!targetGejala) {
        return current;
      }

      const gejala = current.gejala.filter((_, itemIndex) => itemIndex !== index);
      setGejalaProposalDrafts(createGejalaDraftMap(gejala));

      return {
        ...current,
        gejala,
        penyakit: current.penyakit.map((item) => ({
          ...item,
          aturan: item.aturan.filter(
            (rule) => rule.gejala_id !== targetGejala.id
          ),
        })),
      };
    });
  }

  function updatePenyakitField(
    index: number,
    field: "id" | "nama" | "jenis" | "organisme",
    value: string
  ) {
    setWorkingData((current) => {
      const penyakit = [...current.penyakit];
      penyakit[index] = {
        ...penyakit[index],
        [field]: value,
      };
      return { ...current, penyakit };
    });
  }

  function addPenyakit() {
    setWorkingData((current) => {
      const penyakit: KnowledgeBaseData["penyakit"] = [
        ...current.penyakit,
        {
          id: `P${String(current.penyakit.length + 1).padStart(2, "0")}`,
          nama: "Penyakit atau hama baru",
          jenis: "penyakit",
          aturan: current.gejala.slice(0, 1).map((gejala) => ({
            gejala_id: gejala.id,
            cf: 0,
            ket: "Aturan baru belum dikonfigurasi.",
          })),
          solusi: {
            penanganan: [""],
            pencegahan: [""],
          },
        },
      ];

      setNewGejalaDraft((currentDraft) => ({
        ...currentDraft,
        relationRules: syncRelationRulesWithPenyakit(
          currentDraft.relationRules,
          penyakit
        ),
      }));

      return {
        ...current,
        penyakit,
      };
    });
  }

  function deletePenyakit(index: number) {
    setWorkingData((current) => {
      const penyakit = current.penyakit.filter((_, itemIndex) => itemIndex !== index);

      setNewGejalaDraft((currentDraft) => ({
        ...currentDraft,
        relationRules: syncRelationRulesWithPenyakit(
          currentDraft.relationRules,
          penyakit
        ),
      }));

      return {
        ...current,
        penyakit,
      };
    });
  }

  function updateTreatmentList(
    penyakitIndex: number,
    type: "penanganan" | "pencegahan",
    itemIndex: number,
    value: string
  ) {
    setWorkingData((current) => {
      const penyakit = [...current.penyakit];
      const currentPenyakit = penyakit[penyakitIndex];
      const solusi = currentPenyakit.solusi ?? {
        penanganan: [""],
        pencegahan: [""],
      };
      const nextItems = [...solusi[type]];
      nextItems[itemIndex] = value;
      penyakit[penyakitIndex] = {
        ...currentPenyakit,
        solusi: {
          ...solusi,
          [type]: nextItems,
        },
      };
      return { ...current, penyakit };
    });
  }

  function addTreatmentItem(
    penyakitIndex: number,
    type: "penanganan" | "pencegahan"
  ) {
    setWorkingData((current) => {
      const penyakit = [...current.penyakit];
      const currentPenyakit = penyakit[penyakitIndex];
      const solusi = currentPenyakit.solusi ?? {
        penanganan: [],
        pencegahan: [],
      };

      penyakit[penyakitIndex] = {
        ...currentPenyakit,
        solusi: {
          ...solusi,
          [type]: [...solusi[type], ""],
        },
      };

      return { ...current, penyakit };
    });
  }

  function deleteTreatmentItem(
    penyakitIndex: number,
    type: "penanganan" | "pencegahan",
    itemIndex: number
  ) {
    setWorkingData((current) => {
      const penyakit = [...current.penyakit];
      const currentPenyakit = penyakit[penyakitIndex];
      const solusi = currentPenyakit.solusi ?? {
        penanganan: [],
        pencegahan: [],
      };

      penyakit[penyakitIndex] = {
        ...currentPenyakit,
        solusi: {
          ...solusi,
          [type]: solusi[type].filter((_, index) => index !== itemIndex),
        },
      };

      return { ...current, penyakit };
    });
  }

  function updateRule(
    penyakitIndex: number,
    ruleIndex: number,
    field: "gejala_id" | "cf" | "ket",
    value: string
  ) {
    setWorkingData((current) => {
      const penyakit = [...current.penyakit];
      const rules = [...penyakit[penyakitIndex].aturan];
      rules[ruleIndex] = {
        ...rules[ruleIndex],
        [field]:
          field === "cf"
            ? Number(value)
            : field === "gejala_id"
              ? value.toUpperCase()
              : value,
      };
      penyakit[penyakitIndex] = {
        ...penyakit[penyakitIndex],
        aturan: rules,
      };
      return { ...current, penyakit };
    });
  }

  function addRule(penyakitIndex: number) {
    setWorkingData((current) => {
      const penyakit = [...current.penyakit];
      const fallbackGejalaId = current.gejala[0]?.id ?? "";

      penyakit[penyakitIndex] = {
        ...penyakit[penyakitIndex],
        aturan: [
          ...penyakit[penyakitIndex].aturan,
          {
            gejala_id: fallbackGejalaId,
            cf: 0.6,
            ket: "Relasi baru belum dikonfigurasi.",
          },
        ],
      };

      return { ...current, penyakit };
    });
  }

  function deleteRule(penyakitIndex: number, ruleIndex: number) {
    setWorkingData((current) => {
      const penyakit = [...current.penyakit];
      penyakit[penyakitIndex] = {
        ...penyakit[penyakitIndex],
        aturan: penyakit[penyakitIndex].aturan.filter(
          (_, itemIndex) => itemIndex !== ruleIndex
        ),
      };

      return { ...current, penyakit };
    });
  }

  async function handleSave() {
    if (!isAdmin) {
      setSaveState({
        type: "error",
        message: "Hanya admin yang dapat menyimpan knowledge base.",
        errors: [],
        errorCategories: null,
      });
      return;
    }

    setSaving(true);
    setSaveState({ type: "idle", message: "", errors: [], errorCategories: null });

    try {
      const response = await fetch("/api/pakar/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: workingData,
          expectedRevision: loadedRevision,
        }),
      });

      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
        errors?: string[];
        currentRevision?: number | null;
        errorCategories?: unknown;
      };

      if (!response.ok || !payload.success) {
        const normalizedCategories = normalizeSaveErrorCategories(
          payload.errorCategories
        );
        const fallbackMessage =
          response.status === 409
            ? payload.currentRevision !== null &&
              typeof payload.currentRevision === "number"
              ? `Conflict revisi terdeteksi. Revision terbaru saat ini adalah ${payload.currentRevision}.`
              : "Conflict revisi terdeteksi. Muat ulang dashboard lalu ulangi penyimpanan."
            : "Gagal menyimpan perubahan.";

        setSaveState({
          type: "error",
          message: payload.message ?? fallbackMessage,
          errors: payload.errors ?? [],
          errorCategories: normalizedCategories,
        });
        setSaving(false);
        return;
      }

      setSaveState({
        type: "success",
        message: payload.message ?? "Perubahan berhasil disimpan.",
        errors: [],
        errorCategories: null,
      });
      setSaving(false);
      window.location.reload();
    } catch {
      setSaveState({
        type: "error",
        message: "Tidak dapat terhubung ke API simpan.",
        errors: [],
        errorCategories: null,
      });
      setSaving(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await fetch("/api/pakar/logout", { method: "POST" });
    } finally {
      window.location.reload();
    }
  }

  async function handleFeedbackReview(feedbackId: string) {
    if (!isAdmin) {
      setFeedbackState({
        type: "error",
        message: "Hanya admin yang dapat meninjau feedback petani.",
      });
      return;
    }

    setUpdatingFeedbackId(feedbackId);
    setFeedbackState({ type: "idle", message: "" });

    try {
      const response = await fetch("/api/pakar/feedback", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: feedbackId,
          reviewStatus: feedbackStatusDraft[feedbackId] ?? "pending",
          showAsPublicCard: feedbackPublicDraft[feedbackId] ?? false,
          reviewerNotes: feedbackNotes[feedbackId] ?? "",
        }),
      });

      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
        feedback?: FeedbackEntry;
        summary?: FeedbackSummary;
        errors?: string[];
      };

      if (!response.ok || !payload.success || !payload.feedback) {
        setFeedbackState({
          type: "error",
          message:
            payload.errors?.join(" ") ??
            payload.message ??
            "Review feedback belum bisa disimpan.",
        });
        setUpdatingFeedbackId(null);
        return;
      }

      setFeedbackEntries((current) =>
        current.map((item) => (item.id === feedbackId ? payload.feedback! : item))
      );
      setFeedbackSummary(payload.summary ?? null);
      setFeedbackState({
        type: "success",
        message: payload.message ?? "Review feedback berhasil diperbarui.",
      });
      setUpdatingFeedbackId(null);
    } catch {
      setFeedbackState({
        type: "error",
        message: "Tidak dapat terhubung ke API review feedback.",
      });
      setUpdatingFeedbackId(null);
    }
  }

  async function handleSubmitChangeRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingChangeRequest(true);
    setChangeRequestState({ type: "idle", message: "" });

    const structuredPayload = buildChangeRequestStructuredPayload();

    try {
      await submitChangeRequest({
        ...changeRequestForm,
        structuredPayload,
      });
      resetChangeRequestForm();
      setSavingChangeRequest(false);
    } catch (error) {
      setChangeRequestState({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Tidak dapat terhubung ke API usulan perubahan.",
      });
      setSavingChangeRequest(false);
    }
  }

  async function handleSubmitGejalaProposal(
    mode: "create" | "update",
    gejalaId: string
  ) {
    const draft =
      mode === "create" ? resolvedNewGejalaDraft : gejalaProposalDrafts[gejalaId];
    const previousValue =
      mode === "update"
        ? workingData.gejala.find((item) => item.id === gejalaId)
        : null;

    if (!draft) {
      setChangeRequestState({
        type: "error",
        message: "Draft gejala belum tersedia.",
      });
      return;
    }

    setSubmittingGejalaProposalId(gejalaId);
    setChangeRequestState({ type: "idle", message: "" });

    try {
      await submitChangeRequest(buildGejalaProposalRequest(draft, mode, previousValue), {
        successMessage:
          mode === "create"
            ? "Usulan gejala baru berhasil dikirim."
            : `Usulan revisi gejala ${draft.id.trim().toUpperCase()} berhasil dikirim.`,
        onSuccess: () => {
          if (mode === "create") {
            setNewGejalaDraft(
              createEmptyGejalaDraft(suggestedNextGejalaId, workingData.penyakit)
            );
          } else if (previousValue) {
            setGejalaProposalDrafts((current) => ({
              ...current,
              [gejalaId]: createGejalaDraft(previousValue),
            }));
          }
        },
      });
      setSubmittingGejalaProposalId(null);
    } catch (error) {
      setChangeRequestState({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Tidak dapat mengirim usulan gejala.",
      });
      setSubmittingGejalaProposalId(null);
    }
  }

  async function handleReviewChangeRequest(requestId: string) {
    if (!isAdmin) {
      setChangeRequestState({
        type: "error",
        message: "Hanya admin yang dapat meninjau usulan perubahan pakar.",
      });
      return;
    }

    setUpdatingChangeRequestId(requestId);
    setChangeRequestState({ type: "idle", message: "" });

    try {
      const response = await fetch("/api/pakar/change-requests", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: requestId,
          status: changeRequestStatusDraft[requestId] ?? "pending",
          reviewerNotes: changeRequestNotes[requestId] ?? "",
        }),
      });

      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
        request?: ChangeRequestEntry;
        errors?: string[];
      };

      if (!response.ok || !payload.success || !payload.request) {
        setChangeRequestState({
          type: "error",
          message:
            payload.errors?.join(" ") ??
            payload.message ??
            "Status usulan perubahan belum bisa diperbarui.",
        });
        setUpdatingChangeRequestId(null);
        return;
      }

      setChangeRequests((current) =>
        current.map((item) => (item.id === requestId ? payload.request! : item))
      );
      setChangeRequestState({
        type: "success",
        message: payload.message ?? "Status usulan perubahan berhasil diperbarui.",
      });
      setUpdatingChangeRequestId(null);
    } catch {
      setChangeRequestState({
        type: "error",
        message: "Tidak dapat terhubung ke API review usulan perubahan.",
      });
      setUpdatingChangeRequestId(null);
    }
  }

  async function handleApplyChangeRequest(requestId: string) {
    if (!isAdmin) {
      setChangeRequestState({
        type: "error",
        message: "Hanya admin yang dapat menerapkan usulan perubahan pakar.",
      });
      return;
    }

    if (dirty) {
      setChangeRequestState({
        type: "error",
        message:
          "Simpan atau batalkan edit knowledge base manual terlebih dahulu sebelum menerapkan usulan.",
      });
      return;
    }

    setApplyingChangeRequestId(requestId);
    setChangeRequestState({ type: "idle", message: "" });

    try {
      const response = await fetch("/api/pakar/change-requests", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: requestId,
        }),
      });

      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
        request?: ChangeRequestEntry;
        errors?: string[];
      };

      if (!response.ok || !payload.success || !payload.request) {
        setChangeRequestState({
          type: "error",
          message:
            payload.errors?.join(" ") ??
            payload.message ??
            "Usulan perubahan belum bisa diterapkan.",
        });
        setApplyingChangeRequestId(null);
        return;
      }

      setChangeRequestState({
        type: "success",
        message:
          payload.message ??
          "Usulan perubahan berhasil diterapkan ke knowledge base.",
      });
      setApplyingChangeRequestId(null);
      window.location.reload();
    } catch {
      setChangeRequestState({
        type: "error",
        message: "Tidak dapat terhubung ke API penerapan usulan perubahan.",
      });
      setApplyingChangeRequestId(null);
    }
  }

  return (
    <div className="space-y-8">
      <DashboardHeader
        isAdmin={isAdmin}
        saving={saving}
        loggingOut={loggingOut}
        dirty={dirty}
        validationErrors={validation.errors}
        saveState={saveState}
        categorizedSaveErrors={categorizedSaveErrors}
        uncategorizedSaveErrors={uncategorizedSaveErrors}
        onSave={handleSave}
        onLogout={handleLogout}
      />

      <section className="flex flex-wrap gap-3">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
              resolvedActiveTab === tab.id
                ? "bg-[#154212] text-white"
                : "bg-white text-[#154212] shadow-sm hover:bg-[#eef5e8]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </section>

      {resolvedActiveTab === "overview" && (
        <OverviewTab
          isAdmin={isAdmin}
          workingData={workingData}
          feedbackSummary={feedbackSummary}
          publicFeedbackCards={publicFeedbackCards}
          visibleChangeRequests={visibleChangeRequests}
          onUpdateMeta={updateMeta}
          onUpdateThreshold={updateThreshold}
        />
      )}

      {isAdmin && resolvedActiveTab === "feedback" && (
        <FeedbackTab
          feedbackState={feedbackState}
          feedbackSummary={feedbackSummary}
          feedbackLoading={feedbackLoading}
          feedbackEntries={feedbackEntries}
          publicFeedbackCards={publicFeedbackCards}
          feedbackNotes={feedbackNotes}
          feedbackStatusDraft={feedbackStatusDraft}
          feedbackPublicDraft={feedbackPublicDraft}
          updatingFeedbackId={updatingFeedbackId}
          onFeedbackStatusDraftChange={(feedbackId, status) =>
            setFeedbackStatusDraft((current) => ({
              ...current,
              [feedbackId]: status,
            }))
          }
          onFeedbackPublicDraftChange={(feedbackId, value) =>
            setFeedbackPublicDraft((current) => ({
              ...current,
              [feedbackId]: value,
            }))
          }
          onFeedbackNotesChange={(feedbackId, value) =>
            setFeedbackNotes((current) => ({
              ...current,
              [feedbackId]: value,
            }))
          }
          onReviewFeedback={handleFeedbackReview}
        />
      )}

      {resolvedActiveTab === "usulan" && (
        <ChangeRequestsTab
          isAdmin={isAdmin}
          dirty={dirty}
          changeRequestState={changeRequestState}
          changeRequestLoading={changeRequestLoading}
          visibleChangeRequests={visibleChangeRequests}
          changeRequestForm={changeRequestForm}
          changeRequestNotes={changeRequestNotes}
          changeRequestStatusDraft={changeRequestStatusDraft}
          savingChangeRequest={savingChangeRequest}
          updatingChangeRequestId={updatingChangeRequestId}
          applyingChangeRequestId={applyingChangeRequestId}
          onChangeRequestFormChange={updateChangeRequestFormField}
          onChangeRequestNotesChange={(requestId, value) =>
            setChangeRequestNotes((current) => ({
              ...current,
              [requestId]: value,
            }))
          }
          onChangeRequestStatusDraftChange={(requestId, value) =>
            setChangeRequestStatusDraft((current) => ({
              ...current,
              [requestId]: value,
            }))
          }
          onSubmitChangeRequest={handleSubmitChangeRequest}
          onReviewChangeRequest={handleReviewChangeRequest}
          onApplyChangeRequest={handleApplyChangeRequest}
          penyakitList={workingData.penyakit}
          gejalaList={workingData.gejala}
        />
      )}

      {resolvedActiveTab === "gejala" && (
        <GejalaTab
          isAdmin={isAdmin}
          workingData={workingData}
          canCreateGejalaDirectly={canCreateGejalaDirectly}
          gejalaProposalDrafts={gejalaProposalDrafts}
          newGejalaDraft={resolvedNewGejalaDraft}
          submittingGejalaProposalId={submittingGejalaProposalId}
          hasGejalaDraftChanges={hasGejalaDraftChanges}
          isNewGejalaDraftReady={isNewGejalaDraftReady}
          onAddGejala={addGejala}
          onDeleteGejala={deleteGejala}
          onUpdateGejala={updateGejala}
          onUpdateGejalaProposalDraft={updateGejalaProposalDraft}
          onUpdateNewGejalaDraft={updateNewGejalaDraft}
          onUpdateNewGejalaRelationRule={updateNewGejalaRelationRule}
          onSubmitGejalaProposal={handleSubmitGejalaProposal}
          changeRequestState={changeRequestState}
        />
      )}

      {isAdmin && resolvedActiveTab === "penyakit" && (
        <PenyakitTab
          workingData={workingData}
          canCreatePenyakitDirectly={canCreatePenyakitDirectly}
          onAddPenyakit={addPenyakit}
          onDeletePenyakit={deletePenyakit}
          onUpdatePenyakitField={updatePenyakitField}
          onAddTreatmentItem={addTreatmentItem}
          onDeleteTreatmentItem={deleteTreatmentItem}
          onUpdateTreatmentList={updateTreatmentList}
        />
      )}

      {isAdmin && resolvedActiveTab === "cf" && (
        <CfTab
          workingData={workingData}
          onAddRule={addRule}
          onDeleteRule={deleteRule}
          onUpdateRule={updateRule}
        />
      )}
    </div>
  );
}
