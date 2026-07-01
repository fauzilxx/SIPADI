"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import GejalaSection from "@/components/pertanyaan/GejalaSection";
import KelompokSection from "@/components/pertanyaan/KelompokSection";
import PertanyaanHeader from "@/components/pertanyaan/PertanyaanHeader";
import type { PublicKnowledgeBaseResponse } from "@/components/pertanyaan/types";
import PublicSiteNavbar from "@/components/public/PublicSiteNavbar";
import {
  getGejalaByKelompokFromData,
  getKelompokLabel,
  type Gejala,
  type KnowledgeBaseData,
  type SelectedGejalaInput,
} from "@/lib/knowledge-base";

const STORAGE_KEY = "sipadi:selected-gejala";

export default function PertanyaanPage() {
  const router = useRouter();
  const [knowledgeBaseData, setKnowledgeBaseData] =
    useState<KnowledgeBaseData | null>(null);
  const [knowledgeBaseMessage, setKnowledgeBaseMessage] = useState<string | null>(
    null
  );
  const [selectedKelompok, setSelectedKelompok] = useState<string[]>([]);
  const [selectedGejala, setSelectedGejala] = useState<Map<string, number>>(
    new Map()
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadKnowledgeBase() {
      try {
        const response = await fetch("/api/knowledge-base/public", {
          signal: controller.signal,
        });
        const payload = (await response.json()) as PublicKnowledgeBaseResponse;

        if (!response.ok || !payload.success || !payload.gejala) {
          setKnowledgeBaseMessage(
            payload.message ?? "Knowledge base publik belum dapat dimuat."
          );
          return;
        }

        setKnowledgeBaseData({
          _meta: {},
          cf_formula: {},
          penyakit: [],
          gejala: payload.gejala,
        });
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        setKnowledgeBaseMessage("Knowledge base publik belum dapat dimuat.");
      }
    }

    loadKnowledgeBase();

    return () => controller.abort();
  }, []);

  const kelompokOptions = useMemo(() => {
    if (!knowledgeBaseData) {
      return [];
    }

    const grouped = new Map<string, number>();

    for (const gejala of knowledgeBaseData.gejala) {
      grouped.set(gejala.kelompok, (grouped.get(gejala.kelompok) ?? 0) + 1);
    }

    return Array.from(grouped.entries()).map(([id, gejalaCount]) => ({
      id,
      label: getKelompokLabel(id),
      gejalaCount,
    }));
  }, [knowledgeBaseData]);

  const gejalaList = useMemo(
    () =>
      knowledgeBaseData
        ? getGejalaByKelompokFromData(knowledgeBaseData, selectedKelompok)
        : [],
    [knowledgeBaseData, selectedKelompok]
  );

  const groupedGejala = useMemo(() => {
    const groups = new Map<string, Gejala[]>();

    for (const gejala of gejalaList) {
      if (!groups.has(gejala.kelompok)) {
        groups.set(gejala.kelompok, []);
      }

      groups.get(gejala.kelompok)?.push(gejala);
    }

    return Array.from(groups.entries());
  }, [gejalaList]);

  function toggleKelompok(kelompokId: string) {
    setSelectedKelompok((previous) => {
      if (previous.includes(kelompokId)) {
        setSelectedGejala((current) => {
          const next = new Map(current);
          for (const gejala of gejalaList.filter(
            (item) => item.kelompok === kelompokId
          )) {
            next.delete(gejala.id);
          }
          return next;
        });

        return previous.filter((id) => id !== kelompokId);
      }

      return [...previous, kelompokId];
    });
  }

  function toggleGejala(id: string) {
    setSelectedGejala((previous) => {
      const next = new Map(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.set(id, 1);
      }
      return next;
    });
  }

  function updateCf(id: string, cf: number) {
    setSelectedGejala((previous) => {
      const next = new Map(previous);
      if (next.has(id)) {
        next.set(id, cf);
      }
      return next;
    });
  }

  function clearAll() {
    setSelectedKelompok([]);
    setSelectedGejala(new Map());
    sessionStorage.removeItem(STORAGE_KEY);
  }

  function submitDiagnosis() {
    const payload: SelectedGejalaInput[] = Array.from(
      selectedGejala.entries()
    ).map(([id, cfUser]) => ({
      id,
      cfUser,
    }));

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    router.push("/hasil");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <PublicSiteNavbar activePage="pertanyaan" />

      <main className="flex-1 pb-16 pt-28 md:pb-24 md:pt-36">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-12">
          <PertanyaanHeader />

          <KelompokSection
            kelompokOptions={kelompokOptions}
            selectedKelompok={selectedKelompok}
            onToggleKelompok={toggleKelompok}
            onClearAll={clearAll}
          />

          <GejalaSection
            groupedGejala={groupedGejala}
            kelompokOptions={kelompokOptions}
            knowledgeBaseReady={Boolean(knowledgeBaseData)}
            knowledgeBaseMessage={knowledgeBaseMessage}
            selectedKelompok={selectedKelompok}
            selectedGejala={selectedGejala}
            onToggleGejala={toggleGejala}
            onUpdateCf={updateCf}
            onSubmitDiagnosis={submitDiagnosis}
          />
        </div>
      </main>
    </div>
  );
}
