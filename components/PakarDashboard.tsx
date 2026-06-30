"use client";

import { useEffect, useMemo, useState } from "react";

import {
  canDirectEditDashboardField,
  getDirectEditRestrictionReason,
} from "@/lib/dashboard-edit-policy";
import type { DashboardUserRole } from "@/lib/expert-auth";
import {
  validateKnowledgeBaseData,
  type KnowledgeBaseData,
} from "@/lib/knowledge-base";

type TabKey =
  | "overview"
  | "feedback"
  | "usulan"
  | "gejala"
  | "penyakit"
  | "cf";

type SaveErrorCategoryKey =
  | "knowledgeBase"
  | "supplementalSync"
  | "displayReadiness";

interface SaveErrorCategories {
  knowledgeBase: string[];
  supplementalSync: string[];
  displayReadiness: string[];
}

interface SaveState {
  type: "idle" | "success" | "error";
  message: string;
  errors?: string[];
  errorCategories?: SaveErrorCategories | null;
}

interface FeedbackSummary {
  totalFeedback: number;
  totalAccurate: number;
  totalInaccurate: number;
  accuracyPercentage: number;
  averageRating: number;
}

interface FeedbackEntry {
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

interface ChangeRequestEntry {
  id: string;
  submittedAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  appliedAt: string | null;
  status: "pending" | "approved" | "rejected" | "applied";
  title: string;
  requestType:
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

const tabs: { id: TabKey; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "feedback", label: "Feedback Petani" },
  { id: "usulan", label: "Usulan Pakar" },
  { id: "gejala", label: "Kelola Gejala" },
  { id: "penyakit", label: "Penyakit & Solusi" },
  { id: "cf", label: "Matriks CF" },
];

const saveErrorCategoryMeta: Record<
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

function formatDateLabel(value: string | null) {
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

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeSaveErrorCategories(
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

const structureRestrictionMessage = getDirectEditRestrictionReason("gejalaId");
const cfRestrictionMessage = getDirectEditRestrictionReason("cfRule");

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
  const [changeRequestForm, setChangeRequestForm] = useState({
    title: "",
    requestType: "general" as ChangeRequestEntry["requestType"],
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
  const canEditCfDirectly = canDirectEditDashboardField("cfRule");
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

  const gejalaMap = useMemo(() => {
    return new Map(workingData.gejala.map((gejala) => [gejala.id, gejala.label]));
  }, [workingData.gejala]);

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

        return tab.id === "overview" || tab.id === "usulan";
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

  useEffect(() => {
    if (!visibleTabs.some((tab) => tab.id === activeTab)) {
      setActiveTab("overview");
    }
  }, [activeTab, visibleTabs]);

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

  function updateGejala(
    index: number,
    field: "id" | "label" | "kelompok",
    value: string
  ) {
    setWorkingData((current) => {
      const gejala = [...current.gejala];
      gejala[index] = {
        ...gejala[index],
        [field]: value,
      };
      return { ...current, gejala };
    });
  }

  function addGejala() {
    setWorkingData((current) => ({
      ...current,
      gejala: [
        ...current.gejala,
        {
          id: `G${String(current.gejala.length + 1).padStart(2, "0")}`,
          label: "Gejala baru",
          kelompok: "A",
        },
      ],
    }));
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
    setWorkingData((current) => ({
      ...current,
      penyakit: [
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
      ],
    }));
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

  function updateRule(
    penyakitIndex: number,
    ruleIndex: number,
    field: "cf" | "ket",
    value: string
  ) {
    setWorkingData((current) => {
      const penyakit = [...current.penyakit];
      const rules = [...penyakit[penyakitIndex].aturan];
      rules[ruleIndex] = {
        ...rules[ruleIndex],
        [field]: field === "cf" ? Number(value) : value,
      };
      penyakit[penyakitIndex] = {
        ...penyakit[penyakitIndex],
        aturan: rules,
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
        current.map((item) =>
          item.id === feedbackId ? payload.feedback! : item
        )
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

  async function handleSubmitChangeRequest(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setSavingChangeRequest(true);
    setChangeRequestState({ type: "idle", message: "" });

    const structuredPayload = buildChangeRequestStructuredPayload();

    try {
      const response = await fetch("/api/pakar/change-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...changeRequestForm,
          structuredPayload,
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
            "Usulan perubahan belum bisa disimpan.",
        });
        setSavingChangeRequest(false);
        return;
      }

      setChangeRequests((current) => [payload.request!, ...current]);
      setChangeRequestNotes((current) => ({
        ...current,
        [payload.request!.id]: payload.request!.reviewerNotes,
      }));
      setChangeRequestStatusDraft((current) => ({
        ...current,
        [payload.request!.id]: payload.request!.status,
      }));
      resetChangeRequestForm();
      setChangeRequestState({
        type: "success",
        message: payload.message ?? "Usulan perubahan berhasil disimpan.",
      });
      setSavingChangeRequest(false);
    } catch {
      setChangeRequestState({
        type: "error",
        message: "Tidak dapat terhubung ke API usulan perubahan.",
      });
      setSavingChangeRequest(false);
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
        current.map((item) =>
          item.id === requestId ? payload.request! : item
        )
      );
      setChangeRequestState({
        type: "success",
        message:
          payload.message ?? "Status usulan perubahan berhasil diperbarui.",
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
      <section className="rounded-[28px] border border-[#d8e4d0] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-[#7a9a28]">
              {isAdmin ? "Admin Dashboard" : "Pakar Dashboard"}
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#154212]">
              {isAdmin
                ? "Kelola Basis Pengetahuan dan Review Lapangan SIPADI"
                : "Ajukan Perbaikan Pengetahuan SIPADI"}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
              {isAdmin
                ? "Admin mereview feedback petani, memilih card publik, menyetujui usulan pakar, dan menyimpan perubahan knowledge base."
                : "Pakar berfokus pada pemantauan ringkas dan pengajuan usulan perubahan knowledge base tanpa mengubah data inti secara langsung."}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <span className="rounded-full bg-[#eef5e8] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#154212]">
              {isAdmin
                ? dirty
                  ? "Ada perubahan belum disimpan"
                  : "Data sinkron"
                : `Login sebagai pakar: ${currentUsername}`}
            </span>
            <span className="rounded-full border border-[#d9e5d1] bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#154212]">
              Peran: {currentUserRole}
            </span>
            {isAdmin && (
              <button
                onClick={handleSave}
                disabled={saving || !dirty || validation.errors.length > 0}
                className="rounded-2xl bg-[#154212] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12370f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            )}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-2xl border border-[#154212] px-5 py-3 text-sm font-bold text-[#154212] transition hover:bg-[#f0f4ec] disabled:opacity-60"
            >
              {loggingOut ? "Keluar..." : "Keluar"}
            </button>
          </div>
        </div>

        {saveState.message &&
          (saveState.type === "success" ? (
            <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {saveState.message}
            </div>
          ) : (
            <div className="mt-5 space-y-4 rounded-[24px] border border-red-200 bg-red-50/80 px-4 py-4 text-sm text-red-700">
              <div>
                <p className="font-bold text-red-800">Penyimpanan belum berhasil</p>
                <p className="mt-1 leading-relaxed">{saveState.message}</p>
              </div>

              {categorizedSaveErrors.length > 0 && (
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
                  {categorizedSaveErrors.map((category) => (
                    <div
                      key={category.key}
                      className="rounded-2xl border border-red-100 bg-white/70 p-4"
                    >
                      <h3 className="text-sm font-bold text-red-800">
                        {category.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-red-700/90">
                        {category.description}
                      </p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-red-800">
                        Tindakan
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-red-700/90">
                        {category.actionHint}
                      </p>
                      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-red-700">
                        {category.errors.map((error) => (
                          <li key={`${category.key}-${error}`}>- {error}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {uncategorizedSaveErrors.length > 0 && (
                <div className="rounded-2xl border border-red-100 bg-white/70 p-4">
                  <p className="text-sm font-bold text-red-800">
                    Detail Tambahan
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-red-700">
                    {uncategorizedSaveErrors.map((error) => (
                      <li key={error}>- {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

        {isAdmin && validation.errors.length > 0 && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
            <p className="mb-2 font-bold">Validasi lokal menemukan masalah:</p>
            <ul className="space-y-1">
              {validation.errors.slice(0, 8).map((error) => (
                <li key={error}>- {error}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="flex flex-wrap gap-3">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
              activeTab === tab.id
                ? "bg-[#154212] text-white"
                : "bg-white text-[#154212] shadow-sm hover:bg-[#eef5e8]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </section>

      {activeTab === "overview" && (
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold text-[#154212]">
                Ringkasan Dataset
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#f8faf6] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Total Gejala
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                    {workingData.gejala.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f8faf6] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Total Penyakit/Hama
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                    {workingData.penyakit.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f8faf6] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Versi Data
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                    {String(workingData._meta.versi ?? "-")}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f8faf6] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Threshold CF
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                    {Number(workingData.cf_formula.threshold_tampil ?? 0).toFixed(
                      2
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold text-[#154212]">
                {isAdmin ? "Monitor Feedback dan Review" : "Ringkasan Peran Pakar"}
              </h2>
              <div
                className={`grid grid-cols-1 gap-4 ${
                  isAdmin ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2"
                }`}
              >
                <div className="rounded-2xl bg-[#f8faf6] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {isAdmin ? "Total Feedback" : "Total Usulan"}
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                    {isAdmin ? feedbackSummary?.totalFeedback ?? 0 : changeRequests.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f8faf6] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {isAdmin ? "Akurasi" : "Menunggu Review"}
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                    {isAdmin
                      ? `${feedbackSummary?.accuracyPercentage ?? 0}%`
                      : changeRequests.filter((item) => item.status === "pending").length}
                  </p>
                </div>
                {isAdmin && (
                  <div className="rounded-2xl bg-[#f8faf6] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Rating
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                      {feedbackSummary?.averageRating ?? 0}/5
                    </p>
                  </div>
                )}
                {isAdmin && (
                  <div className="rounded-2xl bg-[#f8faf6] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Card Publik
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                      {publicFeedbackCards.length}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {isAdmin ? (
              <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-xl font-bold text-[#154212]">
                  Konfigurasi Inti
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#154212]">
                      Nama Proyek
                    </label>
                    <input
                      value={String(workingData._meta.nama_proyek ?? "")}
                      onChange={(event) =>
                        updateMeta("nama_proyek", event.target.value)
                      }
                      className="w-full rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28] focus:ring-2 focus:ring-[#BAD36F]/40"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#154212]">
                      Versi Data
                    </label>
                    <input
                      value={String(workingData._meta.versi ?? "")}
                      onChange={(event) => updateMeta("versi", event.target.value)}
                      className="w-full rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28] focus:ring-2 focus:ring-[#BAD36F]/40"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#154212]">
                      Threshold Tampil
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={Number(workingData.cf_formula.threshold_tampil ?? 0.2)}
                      onChange={(event) =>
                        updateThreshold(Number(event.target.value))
                      }
                      className="w-full rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28] focus:ring-2 focus:ring-[#BAD36F]/40"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-xl font-bold text-[#154212]">
                  Alur Kerja Pakar
                </h2>
                <div className="space-y-3 text-sm leading-relaxed text-gray-600">
                  <p>
                    Pakar dapat mengajukan koreksi gejala, aturan CF, solusi, atau
                    pencegahan melalui tab usulan.
                  </p>
                  <p>
                    Admin akan meninjau usulan tersebut sebelum perubahan diterapkan
                    ke knowledge base utama.
                  </p>
                  <p>
                    Review feedback petani dan publikasi card testimoni dikelola
                    khusus oleh admin agar alur publik tetap terjaga.
                  </p>
                </div>
              </div>
            )}

            <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold text-[#154212]">
                Antrean Usulan Pakar
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#f8faf6] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Total Usulan
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                    {changeRequests.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f8faf6] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Menunggu Review
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                    {
                      changeRequests.filter((item) => item.status === "pending")
                        .length
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {isAdmin && activeTab === "feedback" && (
        <section className="space-y-6">
          {feedbackState.message && (
            <div
              className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                feedbackState.type === "success"
                  ? "border border-green-200 bg-green-50 text-green-700"
                  : "border border-red-200 bg-red-50 text-red-600"
              }`}
            >
              {feedbackState.message}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Total Feedback
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                {feedbackSummary?.totalFeedback ?? 0}
              </p>
            </div>
            <div className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Sesuai
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                {feedbackSummary?.totalAccurate ?? 0}
              </p>
            </div>
            <div className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Belum Sesuai
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                {feedbackSummary?.totalInaccurate ?? 0}
              </p>
            </div>
            <div className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Card Publik
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[#154212]">
                {publicFeedbackCards.length}
              </p>
            </div>
          </div>

          {feedbackLoading ? (
            <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Sedang memuat feedback petani...</p>
            </div>
          ) : feedbackEntries.length === 0 ? (
            <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                Belum ada feedback petani yang masuk.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {feedbackEntries.map((feedback) => (
                <div
                  key={feedback.id}
                  className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#eef5e8] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#154212]">
                          {feedback.diagnosisNama}
                        </span>
                        <span className="rounded-full bg-[#f8faf6] px-3 py-1 text-xs font-semibold text-[#154212]">
                          Rating {feedback.rating}/5
                        </span>
                        <span className="rounded-full bg-[#f8faf6] px-3 py-1 text-xs font-semibold text-[#154212]">
                          {feedback.isAccurate ? "Dinilai sesuai" : "Dinilai belum sesuai"}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[#154212]">
                        Feedback #{feedback.id}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-[#154212]">
                        Oleh {feedback.submitterName}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        Dikirim {formatDateLabel(feedback.submittedAt)} •
                        Confidence hasil {feedback.diagnosisConfidence}%
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#f8faf6] px-4 py-3 text-sm text-[#154212]">
                      Status review:{" "}
                      <strong className="capitalize">
                        {feedback.reviewStatus}
                      </strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
                    <div className="space-y-4">
                      <div className="rounded-2xl bg-[#f8faf6] p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Catatan Petani
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-gray-700">
                          {feedback.comment || "Petani tidak menambahkan catatan."}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#f8faf6] p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Gejala Terpilih
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {feedback.selectedGejala.map((item) => (
                            <span
                              key={`${feedback.id}-${item.id}`}
                              className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#154212]"
                            >
                              {item.id} • {Math.round(item.cfUser * 100)}%
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[#154212]">
                          Status Review Admin
                        </label>
                        <select
                          value={feedbackStatusDraft[feedback.id] ?? feedback.reviewStatus}
                          onChange={(event) =>
                            setFeedbackStatusDraft((current) => ({
                              ...current,
                              [feedback.id]: event.target.value as FeedbackEntry["reviewStatus"],
                            }))
                          }
                          className="w-full rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28]"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      <label className="flex items-center gap-3 rounded-2xl border border-[#d9e5d1] bg-[#f8faf6] px-4 py-3 text-sm text-[#154212]">
                        <input
                          type="checkbox"
                          checked={feedbackPublicDraft[feedback.id] ?? feedback.showAsPublicCard}
                          onChange={(event) =>
                            setFeedbackPublicDraft((current) => ({
                              ...current,
                              [feedback.id]: event.target.checked,
                            }))
                          }
                          className="h-4 w-4 accent-[#154212]"
                        />
                        Tampilkan sebagai card publik setelah disetujui
                      </label>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[#154212]">
                          Catatan Reviewer
                        </label>
                        <textarea
                          value={feedbackNotes[feedback.id] ?? ""}
                          onChange={(event) =>
                            setFeedbackNotes((current) => ({
                              ...current,
                              [feedback.id]: event.target.value,
                            }))
                          }
                          rows={4}
                          className="min-h-24 w-full rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28]"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs text-gray-500">
                          Terakhir direview: {formatDateLabel(feedback.reviewedAt)}
                        </p>
                        <button
                          onClick={() => handleFeedbackReview(feedback.id)}
                          disabled={updatingFeedbackId === feedback.id}
                          className="rounded-2xl bg-[#154212] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#12370f] disabled:opacity-60"
                        >
                          {updatingFeedbackId === feedback.id
                            ? "Menyimpan..."
                            : "Simpan Review"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {publicFeedbackCards.length > 0 && (
            <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold text-[#154212]">
                Preview Card Feedback Publik
              </h2>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {publicFeedbackCards.map((card) => (
                  <div
                    key={card.id}
                    className="rounded-[20px] border border-[#e7eee0] bg-[#fcfdfa] p-5"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-[#eef5e8] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#154212]">
                        {card.diagnosisNama}
                      </span>
                      <span className="text-sm font-bold text-[#7a9a28]">
                        {card.rating}/5
                      </span>
                    </div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {card.submitterName}
                    </p>
                    <p className="text-sm leading-relaxed text-[#3a4435]">
                      {card.comment || "Feedback publik tanpa catatan tambahan."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {activeTab === "usulan" && (
        <section className="space-y-6">
          {changeRequestState.message && (
            <div
              className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                changeRequestState.type === "success"
                  ? "border border-green-200 bg-green-50 text-green-700"
                  : "border border-red-200 bg-red-50 text-red-600"
              }`}
            >
              {changeRequestState.message}
            </div>
          )}

          <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-[#154212]">
              Ajukan Penambahan atau Perubahan Pakar
            </h2>
            <p className="mb-5 text-sm leading-relaxed text-gray-600">
              Usulan umum tetap boleh diajukan bebas, tetapi jenis usulan
              terstruktur di bawah ini bisa langsung direview admin lalu
              diterapkan ke knowledge base tanpa edit manual ulang.
            </p>
            <form
              className="grid grid-cols-1 gap-4 lg:grid-cols-2"
              onSubmit={handleSubmitChangeRequest}
            >
              <input
                value={changeRequestForm.title}
                onChange={(event) =>
                  setChangeRequestForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Judul usulan perubahan"
                className="rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28]"
              />
              <select
                value={changeRequestForm.requestType}
                onChange={(event) =>
                  setChangeRequestForm((current) => ({
                    ...current,
                    requestType: event.target.value as ChangeRequestEntry["requestType"],
                  }))
                }
                className="rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28]"
              >
                <option value="general">Usulan Umum</option>
                <option value="add_gejala">Tambah Gejala</option>
                <option value="revise_aturan">Revisi Aturan CF</option>
                <option value="revise_solusi">Revisi Solusi</option>
                <option value="revise_pencegahan">Revisi Pencegahan</option>
              </select>
              <input
                value={changeRequestForm.targetPenyakitId}
                onChange={(event) =>
                  setChangeRequestForm((current) => ({
                    ...current,
                    targetPenyakitId: event.target.value,
                  }))
                }
                placeholder="Target penyakit/hama (opsional)"
                className="rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28]"
              />
              <input
                value={changeRequestForm.targetGejalaId}
                onChange={(event) =>
                  setChangeRequestForm((current) => ({
                    ...current,
                    targetGejalaId: event.target.value,
                  }))
                }
                placeholder="Target gejala (opsional)"
                className="rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28]"
              />

              {changeRequestForm.requestType === "add_gejala" && (
                <>
                  <input
                    value={changeRequestForm.proposedGejalaLabel}
                    onChange={(event) =>
                      setChangeRequestForm((current) => ({
                        ...current,
                        proposedGejalaLabel: event.target.value,
                      }))
                    }
                    placeholder="Label gejala baru"
                    className="rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28]"
                  />
                  <select
                    value={changeRequestForm.proposedKelompok}
                    onChange={(event) =>
                      setChangeRequestForm((current) => ({
                        ...current,
                        proposedKelompok: event.target.value,
                      }))
                    }
                    className="rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28]"
                  >
                    <option value="A">Kelompok A - Daun</option>
                    <option value="B">Kelompok B - Batang & Anakan</option>
                    <option value="C">Kelompok C - Malai & Bulir</option>
                    <option value="D">Kelompok D - Organisme & Serangan</option>
                    <option value="E">Kelompok E - Lingkungan</option>
                  </select>
                </>
              )}

              {changeRequestForm.requestType === "revise_aturan" && (
                <>
                  <input
                    type="number"
                    min="-1"
                    max="1"
                    step="0.05"
                    value={changeRequestForm.proposedCf}
                    onChange={(event) =>
                      setChangeRequestForm((current) => ({
                        ...current,
                        proposedCf: event.target.value,
                      }))
                    }
                    placeholder="Nilai CF usulan"
                    className="rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28]"
                  />
                  <input
                    value={changeRequestForm.proposedKet}
                    onChange={(event) =>
                      setChangeRequestForm((current) => ({
                        ...current,
                        proposedKet: event.target.value,
                      }))
                    }
                    placeholder="Keterangan aturan baru"
                    className="rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28]"
                  />
                </>
              )}

              {changeRequestForm.requestType === "revise_solusi" && (
                <textarea
                  value={changeRequestForm.proposedPenanganan}
                  onChange={(event) =>
                    setChangeRequestForm((current) => ({
                      ...current,
                      proposedPenanganan: event.target.value,
                    }))
                  }
                  placeholder="Tulis butir penanganan baru, satu baris satu poin"
                  className="min-h-32 rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28] lg:col-span-2"
                />
              )}

              {changeRequestForm.requestType === "revise_pencegahan" && (
                <textarea
                  value={changeRequestForm.proposedPencegahan}
                  onChange={(event) =>
                    setChangeRequestForm((current) => ({
                      ...current,
                      proposedPencegahan: event.target.value,
                    }))
                  }
                  placeholder="Tulis butir pencegahan baru, satu baris satu poin"
                  className="min-h-32 rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28] lg:col-span-2"
                />
              )}

              <textarea
                value={changeRequestForm.description}
                onChange={(event) =>
                  setChangeRequestForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Alasan atau konteks usulan"
                className="min-h-28 rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28] lg:col-span-2"
              />
              <textarea
                value={changeRequestForm.proposedChange}
                onChange={(event) =>
                  setChangeRequestForm((current) => ({
                    ...current,
                    proposedChange: event.target.value,
                  }))
                }
                placeholder="Tuliskan rincian perubahan yang diajukan"
                className="min-h-32 rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28] lg:col-span-2"
              />
              <div className="lg:col-span-2">
                <button
                  type="submit"
                  disabled={savingChangeRequest}
                  className="rounded-2xl bg-[#154212] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12370f] disabled:opacity-60"
                >
                  {savingChangeRequest ? "Menyimpan..." : "Simpan Usulan"}
                </button>
              </div>
            </form>
          </div>

          {changeRequestLoading ? (
            <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                Sedang memuat usulan perubahan pakar...
              </p>
            </div>
          ) : changeRequests.length === 0 ? (
            <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                Belum ada usulan perubahan yang masuk.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {changeRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#eef5e8] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#154212]">
                          {request.requestType.replaceAll("_", " ")}
                        </span>
                        <span className="rounded-full bg-[#f3f5ef] px-3 py-1 text-xs font-semibold text-[#4d5c47]">
                          Pengusul: {request.submittedByUsername}
                        </span>
                        {request.targetPenyakitId && (
                          <span className="rounded-full bg-[#f8faf6] px-3 py-1 text-xs font-semibold text-[#154212]">
                            {request.targetPenyakitId}
                          </span>
                        )}
                        {request.targetGejalaId && (
                          <span className="rounded-full bg-[#f8faf6] px-3 py-1 text-xs font-semibold text-[#154212]">
                            {request.targetGejalaId}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-[#154212]">
                        {request.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        Diajukan {formatDateLabel(request.submittedAt)} oleh{" "}
                        {request.submittedByRole}.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#f8faf6] px-4 py-3 text-sm text-[#154212]">
                      Status: <strong className="capitalize">{request.status}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
                    <div className="space-y-4">
                      <div className="rounded-2xl bg-[#f8faf6] p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Latar Belakang
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-gray-700">
                          {request.description}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#f8faf6] p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Perubahan yang Diajukan
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-gray-700">
                          {request.proposedChange}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[#154212]">
                          {isAdmin ? "Status Review" : "Status Saat Ini"}
                        </label>
                        {isAdmin && request.status !== "applied" ? (
                          <select
                            value={changeRequestStatusDraft[request.id] ?? request.status}
                            onChange={(event) =>
                              setChangeRequestStatusDraft((current) => ({
                                ...current,
                                [request.id]: event.target.value as ChangeRequestEntry["status"],
                              }))
                            }
                            className="w-full rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28]"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        ) : (
                          <div className="rounded-2xl border border-[#d9e5d1] bg-[#f8faf6] px-4 py-3 text-sm text-[#154212]">
                            {request.status}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[#154212]">
                          {isAdmin ? "Catatan Reviewer" : "Catatan Admin"}
                        </label>
                        {isAdmin ? (
                          <textarea
                            value={changeRequestNotes[request.id] ?? ""}
                            onChange={(event) =>
                              setChangeRequestNotes((current) => ({
                                ...current,
                                [request.id]: event.target.value,
                              }))
                            }
                            rows={4}
                            className="min-h-24 w-full rounded-2xl border border-[#d9e5d1] px-4 py-3 text-sm outline-none focus:border-[#7a9a28]"
                          />
                        ) : (
                          <div className="min-h-24 rounded-2xl border border-[#d9e5d1] bg-[#f8faf6] px-4 py-3 text-sm text-gray-700">
                            {request.reviewerNotes || "Belum ada catatan review dari admin."}
                          </div>
                        )}
                      </div>

                      {request.applicationSummary && (
                        <div className="rounded-2xl border border-[#d9e5d1] bg-[#f8faf6] p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Ringkasan Penerapan
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-gray-700">
                            {request.applicationSummary}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-1 text-xs text-gray-500">
                          <p>Terakhir diubah: {formatDateLabel(request.updatedAt)}</p>
                          <p>
                            Direview:{" "}
                            {request.reviewedByUsername
                              ? `${request.reviewedByUsername} (${formatDateLabel(
                                  request.reviewedAt
                                )})`
                              : "-"}
                          </p>
                          <p>
                            Diterapkan:{" "}
                            {request.appliedByUsername
                              ? `${request.appliedByUsername} (${formatDateLabel(
                                  request.appliedAt
                                )})`
                              : "-"}
                          </p>
                        </div>
                        {isAdmin && (
                          <div className="flex flex-wrap justify-end gap-3">
                            <button
                              onClick={() => handleReviewChangeRequest(request.id)}
                              disabled={updatingChangeRequestId === request.id}
                              className="rounded-2xl bg-[#154212] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#12370f] disabled:opacity-60"
                            >
                              {updatingChangeRequestId === request.id
                                ? "Menyimpan..."
                                : "Simpan Review"}
                            </button>
                            <button
                              onClick={() => handleApplyChangeRequest(request.id)}
                              disabled={
                                applyingChangeRequestId === request.id ||
                                request.status !== "approved" ||
                                !request.structuredPayload ||
                                dirty
                              }
                              className="rounded-2xl border border-[#154212] px-4 py-2.5 text-sm font-bold text-[#154212] transition hover:bg-[#f0f4ec] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {applyingChangeRequestId === request.id
                                ? "Menerapkan..."
                                : "Terapkan ke KB"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {isAdmin && activeTab === "gejala" && (
        <section className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#154212]">Kelola Gejala</h2>
              <p className="text-sm text-gray-600">
                Edit label gejala yang sudah ada. Perubahan struktur seperti ID,
                kelompok, atau penambahan gejala baru diarahkan lewat tab usulan.
              </p>
            </div>
            <button
              onClick={addGejala}
              disabled={!canCreateGejalaDirectly}
              title={structureRestrictionMessage}
              className="rounded-2xl bg-[#BAD36F] px-4 py-2.5 text-sm font-bold text-[#154212] transition hover:bg-[#a9c55c] disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Tambah Gejala Baru
            </button>
          </div>

          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
            {structureRestrictionMessage}
          </div>

          <div className="space-y-4">
            {workingData.gejala.map((gejala, index) => (
              <div
                key={`${gejala.id}-${index}`}
                className="grid grid-cols-1 gap-3 rounded-2xl border border-[#edf2e8] bg-[#fbfcfa] p-4 lg:grid-cols-[0.8fr_2fr_0.8fr]"
              >
                <input
                  value={gejala.id}
                  readOnly
                  aria-readonly="true"
                  title={structureRestrictionMessage}
                  className="cursor-not-allowed rounded-xl border border-[#d9e5d1] bg-gray-100 px-3 py-2.5 text-sm text-gray-500 outline-none"
                />
                <input
                  value={gejala.label}
                  onChange={(event) =>
                    updateGejala(index, "label", event.target.value)
                  }
                  className="rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
                />
                <select
                  value={gejala.kelompok}
                  disabled
                  title={structureRestrictionMessage}
                  className="cursor-not-allowed rounded-xl border border-[#d9e5d1] bg-gray-100 px-3 py-2.5 text-sm text-gray-500 outline-none"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                </select>
              </div>
            ))}
          </div>
        </section>
      )}

      {isAdmin && activeTab === "penyakit" && (
        <section className="space-y-5">
          <div className="flex justify-end">
            <button
              onClick={addPenyakit}
              disabled={!canCreatePenyakitDirectly}
              title={structureRestrictionMessage}
              className="rounded-2xl bg-[#BAD36F] px-4 py-2.5 text-sm font-bold text-[#154212] transition hover:bg-[#a9c55c] disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Tambah Penyakit/Hama
            </button>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
            {structureRestrictionMessage}
          </div>
          {workingData.penyakit.map((penyakit, index) => (
            <div
              key={`${penyakit.id}-${index}`}
              className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-4">
                <input
                  value={penyakit.id}
                  readOnly
                  aria-readonly="true"
                  title={structureRestrictionMessage}
                  className="cursor-not-allowed rounded-xl border border-[#d9e5d1] bg-gray-100 px-3 py-2.5 text-sm text-gray-500 outline-none"
                />
                <input
                  value={penyakit.nama}
                  onChange={(event) =>
                    updatePenyakitField(index, "nama", event.target.value)
                  }
                  className="rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
                />
                <select
                  value={penyakit.jenis}
                  disabled
                  title={structureRestrictionMessage}
                  className="cursor-not-allowed rounded-xl border border-[#d9e5d1] bg-gray-100 px-3 py-2.5 text-sm text-gray-500 outline-none"
                >
                  <option value="hama">Hama</option>
                  <option value="penyakit">Penyakit</option>
                </select>
                <input
                  value={penyakit.organisme ?? ""}
                  onChange={(event) =>
                    updatePenyakitField(index, "organisme", event.target.value)
                  }
                  className="rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
                  placeholder="Organisme (opsional)"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl bg-[#f8faf6] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#154212]">
                      Penanganan Jangka Pendek
                    </h3>
                    <button
                      onClick={() => addTreatmentItem(index, "penanganan")}
                      className="text-xs font-bold text-[#154212]"
                    >
                      + Tambah
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(penyakit.solusi?.penanganan ?? []).map((item, itemIndex) => (
                      <textarea
                        key={`${penyakit.id}-penanganan-${itemIndex}`}
                        value={item}
                        onChange={(event) =>
                          updateTreatmentList(
                            index,
                            "penanganan",
                            itemIndex,
                            event.target.value
                          )
                        }
                        className="min-h-20 w-full rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#f8faf6] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#154212]">
                      Pencegahan Jangka Panjang
                    </h3>
                    <button
                      onClick={() => addTreatmentItem(index, "pencegahan")}
                      className="text-xs font-bold text-[#154212]"
                    >
                      + Tambah
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(penyakit.solusi?.pencegahan ?? []).map((item, itemIndex) => (
                      <textarea
                        key={`${penyakit.id}-pencegahan-${itemIndex}`}
                        value={item}
                        onChange={(event) =>
                          updateTreatmentList(
                            index,
                            "pencegahan",
                            itemIndex,
                            event.target.value
                          )
                        }
                        className="min-h-20 w-full rounded-xl border border-[#d9e5d1] px-3 py-2.5 text-sm outline-none focus:border-[#7a9a28]"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {isAdmin && activeTab === "cf" && (
        <section className="space-y-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
            {cfRestrictionMessage}
          </div>
          {workingData.penyakit.map((penyakit, penyakitIndex) => (
            <div
              key={`${penyakit.id}-cf`}
              className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-5">
                <h2 className="text-xl font-bold text-[#154212]">
                  {penyakit.id} - {penyakit.nama}
                </h2>
                <p className="text-sm text-gray-600">
                  Edit nilai CF pakar dan keterangan relasi gejala untuk{" "}
                  {penyakit.nama}.
                </p>
              </div>

              <div className="space-y-4">
                {penyakit.aturan.map((rule, ruleIndex) => (
                  <div
                    key={`${penyakit.id}-${rule.gejala_id}`}
                    className="grid grid-cols-1 gap-3 rounded-2xl border border-[#edf2e8] bg-[#fbfcfa] p-4 lg:grid-cols-[1.2fr_0.6fr_1.8fr]"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {rule.gejala_id}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#154212]">
                        {gejalaMap.get(rule.gejala_id) ?? rule.gejala_id}
                      </p>
                    </div>
                    <input
                      type="number"
                      min="-1"
                      max="1"
                      step="0.05"
                      value={rule.cf}
                      disabled={!canEditCfDirectly}
                      title={cfRestrictionMessage}
                      className="cursor-not-allowed rounded-xl border border-[#d9e5d1] bg-gray-100 px-3 py-2.5 text-sm text-gray-500 outline-none"
                    />
                    <textarea
                      value={rule.ket}
                      disabled={!canEditCfDirectly}
                      title={cfRestrictionMessage}
                      className="min-h-20 cursor-not-allowed rounded-xl border border-[#d9e5d1] bg-gray-100 px-3 py-2.5 text-sm text-gray-500 outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
