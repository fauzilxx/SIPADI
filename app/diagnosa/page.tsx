"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { type Evidence, type HasilDiagnosis } from "@/lib/sipadi/types";
import { type WizardState, type WizardStep, type KelompokId, KELOMPOK_INFO } from "@/lib/sipadi/nextQuestion";
import { diagnosis } from "@/lib/sipadi/cfEngine";
import { PENYAKIT_DETAILS } from "./recommendations";

const CF_LABEL: Record<string, string> = {
  "-1": "Pasti Tidak",
  "-0.8": "Hampir Pasti Tidak",
  "-0.6": "Mungkin Tidak",
  "-0.4": "Barangkali Tidak",
  "-0.2": "Sedikit Yakin Tidak",
  "0": "Tidak Tahu",
  "0.2": "Sedikit Yakin",
  "0.4": "Barangkali",
  "0.6": "Mungkin",
  "0.8": "Hampir Pasti",
  "1": "Pasti",
};

function getCFLabel(val: number): string {
  const rounded = Math.round(val * 10) / 10;
  return CF_LABEL[String(rounded)] || "Tidak Tahu";
}

export default function DiagnosaPage() {
  const [wizardState, setWizardState] = useState<WizardState | null>(null);
  const [wizardStep, setWizardStep] = useState<WizardStep | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<HasilDiagnosis[]>([]);

  // Initialize wizard state from server
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/next-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        if (!res.ok) throw new Error("Gagal mengambil data awal wizard.");
        const data = await res.json();
        setWizardState(data.state);
        setWizardStep(data.step);
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan koneksi.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  // Update client-side live preview in real time when local evidence list changes
  useEffect(() => {
    if (wizardState && wizardState.evidence) {
      try {
        const results = diagnosis(wizardState.evidence);
        setLocalPreview(results);
      } catch {
        // Fallback
      }
    } else {
      setLocalPreview([]);
    }
  }, [wizardState?.evidence]);

  const handleSelectKelompok = async (kelompokId: KelompokId) => {
    if (!wizardState) return;
    try {
      setLoading(true);
      const res = await fetch("/api/next-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: wizardState,
          aksi: "pilih_kelompok",
          kelompok: kelompokId,
        }),
      });
      if (!res.ok) throw new Error("Gagal memilih kelompok.");
      const data = await res.json();
      setWizardState(data.state);
      setWizardStep(data.step);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelesaikanKelompok = async () => {
    if (!wizardState) return;
    try {
      setLoading(true);
      const res = await fetch("/api/next-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: wizardState,
          aksi: "selesaikan_kelompok",
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan jawaban kelompok.");
      const data = await res.json();
      setWizardState(data.state);
      setWizardStep(data.step);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToKelompok = async () => {
    if (!wizardState) return;
    try {
      setLoading(true);
      const updatedState = { ...wizardState, kelompokAktif: null };
      const res = await fetch("/api/next-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: updatedState,
          aksi: "next",
        }),
      });
      if (!res.ok) throw new Error("Gagal kembali ke pemilihan kelompok.");
      const data = await res.json();
      setWizardState(data.state);
      setWizardStep(data.step);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDiagnosa = async () => {
    if (!wizardState) return;
    try {
      setLoading(true);
      // Mark all groups as completed to transition to selesai
      const updatedState: WizardState = {
        ...wizardState,
        kelompokSelesai: ["A", "B", "C", "D", "E"],
        kelompokAktif: null,
      };
      const res = await fetch("/api/next-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: updatedState,
          aksi: "next",
        }),
      });
      if (!res.ok) throw new Error("Gagal menghitung hasil diagnosis akhir.");
      const data = await res.json();
      setWizardState(data.state);
      setWizardStep(data.step);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/next-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Gagal mematikan/mereset diagnosis.");
      const data = await res.json();
      setWizardState(data.state);
      setWizardStep(data.step);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (gejalaId: string, value: number) => {
    if (!wizardState) return;
    const existingIdx = wizardState.evidence.findIndex((e) => e.gejalaId === gejalaId);
    let newEvidence = [...wizardState.evidence];

    if (existingIdx >= 0) {
      if (value === 0) {
        newEvidence.splice(existingIdx, 1);
      } else {
        newEvidence[existingIdx] = { gejalaId, cfUser: value };
      }
    } else if (value !== 0) {
      newEvidence.push({ gejalaId, cfUser: value });
    }

    setWizardState({
      ...wizardState,
      evidence: newEvidence,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to get selected CF value for a symptom
  const getSelectedCF = (gejalaId: string): number => {
    if (!wizardState) return 0;
    const found = wizardState.evidence.find((e) => e.gejalaId === gejalaId);
    return found ? found.cfUser : 0;
  };

  // Loading state render
  if (loading && !wizardState) {
    return (
      <div className="flex flex-1 flex-col bg-[#F9FAF4] min-h-screen items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3F20]"></div>
        <p className="mt-4 text-[#1E3F20] font-medium">Memuat Sistem Diagnosa...</p>
      </div>
    );
  }

  // Error state render
  if (error && !wizardState) {
    return (
      <div className="flex flex-1 flex-col bg-[#F9FAF4] min-h-screen items-center justify-center p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md text-center">
          <p className="text-red-700 font-semibold mb-3">Terjadi Kesalahan</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-[#1E3F20] text-white rounded-lg hover:bg-opacity-90 transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const activeStepType = wizardStep?.tipe || "pilih_kelompok";
  const kelompokSelesaiCount = wizardState?.kelompokSelesai.length || 0;
  const progressPercent = (kelompokSelesaiCount / 5) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBF6] font-sans text-zinc-800 antialiased">
      {/* Topbar / Navigation Header */}
      <header className="bg-[#b0cf6a] print:hidden border-b border-black/5 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-[#1E3F20] flex items-center gap-1.5 tracking-tight">
              <span className="text-2xl">🌾</span> SIPADI
            </span>
            <span className="text-xs uppercase bg-[#1E3F20]/10 text-[#1E3F20] px-2 py-0.5 rounded font-semibold tracking-wider">
              Expert System
            </span>
          </div>

          <nav className="flex space-x-1 sm:space-x-4 text-sm font-medium">
            <Link href="/" className="text-[#1E3F20]/75 hover:text-[#1E3F20] px-3 py-2 rounded-md transition">
              Home
            </Link>
            <button
              onClick={handleReset}
              className="text-[#1E3F20]/75 hover:text-[#1E3F20] px-3 py-2 rounded-md transition"
            >
              Mulai Ulang
            </button>
            <span className="border-b-2 border-[#1E3F20] text-[#1E3F20] px-3 py-2">
              Diagnosis
            </span>
          </nav>
        </div>
      </header>

      {/* Progress & Breadcrumbs */}
      <section className="bg-white border-b border-zinc-100 py-4 print:hidden">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <span className={activeStepType !== "selesai" ? "text-[#1E3F20] underline" : ""}>1. Input Gejala</span>
            <span>➔</span>
            <span className={activeStepType === "selesai" ? "text-[#1E3F20] underline" : ""}>2. Hasil Diagnosa</span>
          </div>

          {activeStepType !== "selesai" && (
            <div className="flex items-center gap-3 flex-1 sm:max-w-xs justify-end">
              <span className="text-xs font-medium text-zinc-500 whitespace-nowrap">
                {kelompokSelesaiCount} / 5 Kelompok Selesai
              </span>
              <div className="w-24 bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#1E3F20] h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Content Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        
        {/* SCREEN 1: PILIH KELOMPOK GEJALA */}
        {activeStepType === "pilih_kelompok" && wizardStep && (
          <div className="space-y-6">
            <div className="text-center sm:text-left space-y-2">
              <span className="text-xs font-bold text-[#1E3F20]/75 uppercase tracking-widest bg-[#E6F4D0] px-3 py-1 rounded-full">
                Langkah 1 — Pilih Kelompok Gejala
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E3F20] tracking-tight">
                Gejala apa yang Anda amati?
              </h1>
              <p className="text-zinc-600 text-sm max-w-2xl leading-relaxed">
                Pilih salah satu kelompok di bawah ini untuk menginput tingkat keyakinan gejala secara detail. Anda dapat melihat hasil diagnosis kapan saja setelah mengisi minimal satu kelompok.
              </p>
            </div>

            {/* Kelompok Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(["A", "B", "C", "D", "E"] as KelompokId[]).map((id) => {
                const info = KELOMPOK_INFO[id];
                const isSelesai = wizardState?.kelompokSelesai.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => handleSelectKelompok(id)}
                    className={`text-left p-5 bg-white border border-zinc-200/80 rounded-2xl shadow-sm hover:border-[#1E3F20] hover:shadow-md transition-all duration-200 flex items-start gap-4 relative overflow-hidden group ${
                      isSelesai ? "opacity-70 bg-zinc-50/50" : ""
                    }`}
                  >
                    <div className="text-3xl p-3 bg-[#FAFBF6] rounded-xl group-hover:bg-[#E6F4D0] transition duration-200">
                      {info.icon}
                    </div>
                    <div className="space-y-1 pr-6">
                      <h3 className="font-bold text-[#1E3F20] text-base">{info.label}</h3>
                      <p className="text-xs text-zinc-500 leading-relaxed pr-2">{info.deskripsi}</p>
                      <div className="pt-2 flex items-center">
                        {isSelesai ? (
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100">
                            ✓ Terisi
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-zinc-400 group-hover:text-[#1E3F20] transition">
                            Mulai Input →
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="absolute top-3 right-4 font-black text-4xl text-zinc-100/50 group-hover:text-zinc-100 select-none">
                      {id}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Action Bar */}
            <div className="pt-6 border-t border-zinc-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-zinc-500 italic">
                *Direkomendasikan mengisi sebanyak mungkin gejala untuk hasil diagnosis yang lebih akurat.
              </p>
              <button
                onClick={handleGoToDiagnosa}
                disabled={!wizardState || wizardState.evidence.length === 0}
                className={`w-full sm:w-auto px-6 py-3 bg-[#1E3F20] text-white rounded-xl font-bold shadow-md flex items-center justify-center gap-2 hover:bg-opacity-95 transition-all active:scale-[0.98] ${
                  !wizardState || wizardState.evidence.length === 0
                    ? "opacity-40 cursor-not-allowed"
                    : ""
                }`}
              >
                Diagnosa Sekarang ↗
              </button>
            </div>

            {/* Candidate Live Preview Box */}
            {localPreview.length > 0 && (
              <div className="bg-[#EAF3DE]/70 border border-[#C0DD97] rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E3F20] flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#1E3F20] animate-pulse"></span>
                  Kandidat Penyakit Sementara ({localPreview.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {localPreview.slice(0, 4).map((p) => (
                    <div key={p.penyakitId} className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-[#C0DD97]/50 space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span className="text-zinc-800 truncate pr-2">{p.nama}</span>
                        <span className="text-[#1E3F20] flex-shrink-0">{Math.round(p.cfTotal * 100)}%</span>
                      </div>
                      <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#1E3F20] h-full"
                          style={{ width: `${Math.max(0, p.cfTotal * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SCREEN 2: TANYA GEJALA */}
        {activeStepType === "tanya_gejala" && wizardStep && (
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1E3F20] bg-[#E6F4D0] px-3 py-1 rounded-full uppercase tracking-wider">
                  Kelompok {wizardState?.kelompokAktif}
                </span>
                <span className="text-zinc-400">/</span>
                <span className="text-xs font-medium text-zinc-500">
                  {("kelompok" in wizardStep) ? wizardStep.kelompok.label : ""}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E3F20] tracking-tight">
                Seberapa yakin Anda melihat gejala ini?
              </h1>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Geser slider ke kanan jika gejala jelas terlihat, geser ke kiri jika Anda yakin gejala tersebut tidak ada. Biarkan di tengah jika Anda ragu-ragu atau tidak mengamati gejala tersebut.
              </p>
            </div>

            {/* Live Preview Bar */}
            {localPreview.length > 0 && (
              <div className="bg-[#EAF3DE]/60 border border-[#C0DD97]/80 rounded-xl p-3.5 flex items-center justify-between text-xs">
                <span className="font-bold text-[#1E3F20] flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#1E3F20] animate-pulse"></span>
                  Kandidat Teratas:
                </span>
                <div className="flex items-center gap-3 font-semibold text-zinc-700">
                  <span className="bg-white/80 px-2 py-1 rounded border border-[#C0DD97]/50">
                    {localPreview[0].nama} ({Math.round(localPreview[0].cfTotal * 100)}%)
                  </span>
                  {localPreview[1] && (
                    <span className="hidden sm:inline bg-white/40 px-2 py-1 rounded">
                      {localPreview[1].nama} ({Math.round(localPreview[1].cfTotal * 100)}%)
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Symptoms Questionnaire List */}
            <div className="space-y-3">
              {("gejala" in wizardStep) &&
                wizardStep.gejala.map((g) => {
                  const val = getSelectedCF(g.id);
                  const isModified = val !== 0;

                  return (
                    <div
                      key={g.id}
                      className={`p-4 bg-white border rounded-2xl shadow-sm transition duration-200 ${
                        isModified ? "border-[#1E3F20] bg-white" : "border-zinc-200/80"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1 md:max-w-lg">
                          <span className="text-xs font-bold text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-100">
                            {g.id}
                          </span>
                          <p className="text-sm font-semibold text-zinc-800 leading-relaxed pt-1">{g.label}</p>
                        </div>

                        {/* Slider controls */}
                        <div className="space-y-2 flex-1 md:max-w-xs">
                          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-wider px-1">
                            <span>Pasti Tidak</span>
                            <span>Tidak Tahu</span>
                            <span>Pasti Ada</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="-1"
                              max="1"
                              step="0.2"
                              value={val}
                              onChange={(e) => handleSliderChange(g.id, parseFloat(e.target.value))}
                              className="flex-1 h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-[#1E3F20]"
                            />
                            <span
                              className={`text-xs font-extrabold w-12 text-right transition ${
                                isModified ? "text-[#1E3F20]" : "text-zinc-400"
                              }`}
                            >
                              {val > 0 ? `+${val.toFixed(1)}` : val.toFixed(1)}
                            </span>
                          </div>

                          <div
                            className={`text-center text-xs font-medium py-0.5 rounded-md transition ${
                              isModified
                                ? "bg-[#E6F4D0] text-[#1E3F20] font-bold"
                                : "text-zinc-400 bg-zinc-50"
                            }`}
                          >
                            {getCFLabel(val)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-zinc-200/60">
              <button
                onClick={handleBackToKelompok}
                className="px-5 py-2.5 bg-white border border-zinc-200 text-zinc-700 font-semibold rounded-xl hover:bg-zinc-50 transition active:scale-95"
              >
                ← Kembali
              </button>
              <button
                onClick={handleSelesaikanKelompok}
                className="px-6 py-2.5 bg-[#1E3F20] text-white font-bold rounded-xl shadow hover:bg-opacity-95 transition active:scale-95 flex items-center gap-1.5"
              >
                Simpan & Lanjut →
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 3: HASIL DIAGNOSIS */}
        {activeStepType === "selesai" && (
          <div className="space-y-8">
            
            {/* Header */}
            <div className="text-center sm:text-left space-y-2 print:space-y-4 print:text-left">
              <span className="text-xs font-bold text-[#1E3F20]/75 uppercase tracking-widest bg-[#E6F4D0] px-3 py-1 rounded-full print:hidden">
                Hasil Analisis
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E3F20] tracking-tight">
                Hasil Diagnosa Akhir
              </h1>
              <p className="text-zinc-500 text-sm max-w-2xl leading-relaxed print:text-zinc-600">
                Berikut adalah hasil diagnosis hama & penyakit padi yang dihitung berdasarkan gejala-gejala yang Anda input menggunakan metode Certainty Factor.
              </p>
            </div>

            {localPreview.length === 0 ? (
              <div className="bg-white border border-zinc-200/80 rounded-3xl p-12 text-center space-y-4 shadow-sm">
                <span className="text-5xl inline-block">🌾</span>
                <h3 className="text-lg font-bold text-zinc-800">Tidak ada gejala yang terdeteksi</h3>
                <p className="text-zinc-500 text-sm max-w-md mx-auto leading-relaxed">
                  Kami tidak mendeteksi penyakit atau hama dengan kepastian tinggi. Silakan ulangi diagnosis dan pilih gejala yang teramati di lapangan secara teliti.
                </p>
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-[#1E3F20] text-white font-bold rounded-xl hover:bg-opacity-90 transition"
                >
                  Ulangi Diagnosa
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Primary Diagnosis Details Card */}
                {(() => {
                  const primary = localPreview[0];
                  const detail = PENYAKIT_DETAILS[primary.penyakitId] || {
                    organisme: primary.organisme || "N/A",
                    deskripsi: "Gejala yang Anda masukkan mengindikasikan adanya patogen/hama ini pada pertanaman padi Anda.",
                    rekomendasi: primary.rekomendasi || {
                      penanganan_jangka_pendek: ["Konsultasikan dengan petugas penyuluh pertanian lapangan (PPL)."],
                      pencegahan_jangka_panjang: ["Terapkan sanitasi lahan dan pemupukan berimbang."],
                    },
                  };

                  const isBlast = primary.penyakitId === "P06";

                  return (
                    <div className="space-y-6">
                      
                      {/* Main Summary Section */}
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        
                        {/* Text summary (Left Column) */}
                        <div className="md:col-span-3 bg-white border border-zinc-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl p-2.5 bg-[#E6F4D0] text-[#1E3F20] rounded-2xl flex items-center justify-center">
                                🐛
                              </span>
                              <div>
                                <h2 className="text-2xl font-black text-[#1E3F20] leading-tight">
                                  {primary.nama}
                                </h2>
                                <p className="text-sm italic text-zinc-500 font-medium pt-0.5">
                                  {detail.organisme}
                                </p>
                              </div>
                            </div>

                            <div className="inline-block">
                              <span className="text-xs font-extrabold text-white bg-[#1E3F20] px-4 py-1.5 rounded-full flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                                Tingkat Kepercayaan {Math.round(primary.cfTotal * 100)}%
                              </span>
                            </div>

                            <p className="text-sm text-zinc-600 leading-relaxed pt-2">
                              {detail.deskripsi}
                            </p>
                          </div>

                          <div className="text-xs text-zinc-400 font-medium border-t border-zinc-100 pt-4">
                            *Jenis: {primary.jenis.toUpperCase()}
                          </div>
                        </div>

                        {/* Image section (Right Column) */}
                        <div className="md:col-span-2 flex items-stretch">
                          <div className="w-full bg-white border border-dashed border-zinc-200 rounded-3xl p-4 shadow-sm flex flex-col items-center justify-center relative overflow-hidden min-h-[220px]">
                            {isBlast ? (
                              <img
                                src="/rice_blast.png"
                                alt="Daun padi terkena Penyakit Blas"
                                className="w-full h-full object-cover rounded-2xl"
                              />
                            ) : (
                              <div className="text-center p-6 space-y-3">
                                <span className="text-5xl block animate-bounce">🌾</span>
                                <div className="space-y-1">
                                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                    Ilustrasi Lapangan
                                  </p>
                                  <p className="text-xs text-zinc-400 max-w-[180px] mx-auto">
                                    Visual daun untuk hama/penyakit ini dapat dikonsultasikan lebih lanjut.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Detailed Recommendations section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-6">
                        
                        {/* Short-term recommendations */}
                        <div className="bg-white border border-zinc-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                          <h3 className="font-extrabold text-base text-[#1E3F20] flex items-center gap-2 pb-2 border-b border-zinc-50">
                            <span className="text-xl">🩹</span> Rekomendasi Penanganan Jangka Pendek
                          </h3>
                          <ul className="space-y-3.5">
                            {detail.rekomendasi.penanganan_jangka_pendek.map((item, idx) => {
                              const [boldTitle, textBody] = item.split(": ");
                              return (
                                <li key={idx} className="text-sm text-zinc-600 leading-relaxed flex items-start gap-2.5">
                                  <span className="text-[#1E3F20] text-base pt-0.5 select-none">🍃</span>
                                  <span>
                                    {textBody ? (
                                      <>
                                        <strong className="text-zinc-800 font-bold">{boldTitle}</strong>: {textBody}
                                      </>
                                    ) : (
                                      item
                                    )}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        {/* Long-term recommendations */}
                        <div className="bg-white border border-zinc-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                          <h3 className="font-extrabold text-base text-[#1E3F20] flex items-center gap-2 pb-2 border-b border-zinc-50">
                            <span className="text-xl">🛡️</span> Strategi Pencegahan Jangka Panjang
                          </h3>
                          <ul className="space-y-3.5">
                            {detail.rekomendasi.pencegahan_jangka_panjang.map((item, idx) => {
                              const [boldTitle, textBody] = item.split(": ");
                              return (
                                <li key={idx} className="text-sm text-zinc-600 leading-relaxed flex items-start gap-2.5">
                                  <span className="text-[#1E3F20] text-base pt-0.5 select-none">✓</span>
                                  <span>
                                    {textBody ? (
                                      <>
                                        <strong className="text-zinc-800 font-bold">{boldTitle}</strong>: {textBody}
                                      </>
                                    ) : (
                                      item
                                    )}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Print & Action Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4 print:hidden">
                  <button
                    onClick={handleReset}
                    className="w-full sm:w-auto px-6 py-3 bg-white border border-zinc-200 text-zinc-700 font-bold rounded-xl hover:bg-zinc-50 transition shadow-sm active:scale-95"
                  >
                    ← Mulai Ulang
                  </button>
                  
                  <button
                    onClick={handlePrint}
                    className="w-full sm:w-auto px-6 py-3 bg-[#1E3F20] text-white font-bold rounded-xl shadow-md hover:bg-opacity-95 transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span className="text-lg">🖨️</span> Cetak Hasil Diagnosa
                  </button>
                </div>

                {/* Secondary diagnoses */}
                {localPreview.length > 1 && (
                  <div className="space-y-4 pt-6 border-t border-zinc-200/60 print:break-before-page">
                    <h3 className="text-lg font-bold text-[#1E3F20] tracking-tight">
                      Kemungkinan Diagnosa Lainnya
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {localPreview.slice(1).map((p) => {
                        const isHama = p.jenis === "hama";
                        return (
                          <div
                            key={p.penyakitId}
                            className="bg-white border border-zinc-200/60 rounded-2xl p-4 space-y-3 shadow-sm"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-[#1E3F20]">{p.nama}</h4>
                                <p className="text-xs text-zinc-400 italic">{p.organisme || "Patogen Tanaman"}</p>
                              </div>
                              <span
                                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                                  isHama
                                    ? "bg-amber-50 text-amber-800 border border-amber-100"
                                    : "bg-blue-50 text-blue-800 border border-blue-100"
                                }`}
                              >
                                {p.jenis}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-zinc-500 font-medium">
                                <span>Nilai CF / Tingkat Keyakinan</span>
                                <span className="font-bold text-[#1E3F20]">
                                  {Math.round(p.cfTotal * 100)}%
                                </span>
                              </div>
                              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-[#1E3F20] h-full"
                                  style={{ width: `${Math.max(0, p.cfTotal * 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#b0cf6a]/30 print:bg-white print:border-t print:border-zinc-200 py-8 border-t border-zinc-200/40 text-[#1E3F20]">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-1">
            <span className="font-bold text-base tracking-tight flex items-center justify-center md:justify-start gap-1">
              🚜 Sistem Pakar Diagnosa Padi
            </span>
            <p className="text-xs text-zinc-500 font-medium">
              © 2026 SIPADI - Sistem Pakar Diagnosa Padi. Artificial Intelligence.
            </p>
          </div>

          <div className="flex space-x-6 text-xs font-bold">
            <a href="#" className="hover:underline">
              Tentang Kami
            </a>
            <a href="#" className="hover:underline">
              Bantuan
            </a>
          </div>
        </div>
      </footer>

      {/* Tailwind print style override */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          header, footer, button, select, input, section {
            display: none !important;
          }
          main {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:break-before-page {
            break-before: page;
          }
        }
      `}</style>
    </div>
  );
}
