/**
 * SIPADI — Forward Chaining + Certainty Factor Engine
 *
 * Implements the CF combination formulas defined in knowledge_base_v2.json:
 *   - Both positive:  CF_comb = CF1 + CF2 * (1 - CF1)
 *   - Both negative:  CF_comb = CF1 + CF2 * (1 + CF1)
 *   - Mixed signs:    CF_comb = (CF1 + CF2) / (1 - min(|CF1|, |CF2|))
 *
 * Diagnosis is displayed if CF_combined >= threshold (0.2).
 */

import knowledgeBase from "../knowledge_base_v2.json";

// ─── Types ───────────────────────────────────────────────────────────

export interface Gejala {
  id: string;
  label: string;
  kelompok: string;
}

export interface AturanEntry {
  gejala_id: string;
  cf: number;
  ket: string;
}

export interface Treatment {
  penanganan: string[];
  pencegahan: string[];
}

export interface Penyakit {
  id: string;
  nama: string;
  jenis: "hama" | "penyakit";
  aturan: AturanEntry[];
  solusi?: Treatment;
}

export interface DiagnosisResult {
  penyakitId: string;
  nama: string;
  jenis: "hama" | "penyakit";
  cfFinal: number;               // final combined CF (-1 … +1)
  cfPercentage: number;           // cfFinal mapped to 0–100%
  matchedGejala: {
    id: string;
    label: string;
    cf: number;           // weighted CF (cfPakar * cfUser)
    cfUser: number;       // user input CF
    cfPakar: number;      // original rule CF
    ket: string;
  }[];
}

// ─── CF Combination (Shortliffe & Buchanan) ──────────────────────────

function combineCF(cf1: number, cf2: number): number {
  if (cf1 >= 0 && cf2 >= 0) {
    // Both positive
    return cf1 + cf2 * (1 - cf1);
  } else if (cf1 < 0 && cf2 < 0) {
    // Both negative
    return cf1 + cf2 * (1 + cf1);
  } else {
    // Mixed signs
    const denominator = 1 - Math.min(Math.abs(cf1), Math.abs(cf2));
    if (denominator === 0) return 0; // edge-case guard
    return (cf1 + cf2) / denominator;
  }
}

// ─── Main Diagnosis Function ─────────────────────────────────────────

/**
 * Run forward-chaining diagnosis.
 *
 * @param selectedGejala  Array of user symptom input with CF (e.g. [{id: "G01", cfUser: 0.8}])
 * @returns  Array of DiagnosisResult sorted descending by cfFinal,
 *           filtered to CF >= threshold (0.2)
 */
export function diagnose(selectedGejala: { id: string; cfUser: number }[]): DiagnosisResult[] {
  const THRESHOLD = (knowledgeBase.cf_formula as { threshold_tampil: number }).threshold_tampil ?? 0.2;
  const penyakitList: Penyakit[] = knowledgeBase.penyakit as Penyakit[];
  const gejalaMap = new Map<string, Gejala>();

  for (const g of knowledgeBase.gejala as Gejala[]) {
    gejalaMap.set(g.id, g);
  }

  const selectedMap = new Map<string, number>();
  for (const sg of selectedGejala) {
    selectedMap.set(sg.id, sg.cfUser);
  }

  const results: DiagnosisResult[] = [];

  for (const penyakit of penyakitList) {
    // Collect CF values only for the symptoms the user selected
    const matchedRules = penyakit.aturan
      .filter((r) => selectedMap.has(r.gejala_id))
      .map((r) => ({
        ...r,
        cfUser: selectedMap.get(r.gejala_id)!,
        cfPakar: r.cf,
        cfWeighted: r.cf * selectedMap.get(r.gejala_id)!,
      }));

    if (matchedRules.length === 0) continue;

    // Combine CFs sequentially using the Shortliffe–Buchanan formula
    let cfCombined = matchedRules[0].cfWeighted;
    for (let i = 1; i < matchedRules.length; i++) {
      cfCombined = combineCF(cfCombined, matchedRules[i].cfWeighted);
    }

    // Clamp to [-1, 1] to handle floating-point drift
    cfCombined = Math.max(-1, Math.min(1, cfCombined));

    if (cfCombined >= THRESHOLD) {
      results.push({
        penyakitId: penyakit.id,
        nama: penyakit.nama,
        jenis: penyakit.jenis,
        cfFinal: cfCombined,
        cfPercentage: Math.round(cfCombined * 100),
        matchedGejala: matchedRules.map((r) => ({
          id: r.gejala_id,
          label: gejalaMap.get(r.gejala_id)?.label ?? r.gejala_id,
          cf: r.cfWeighted,
          cfUser: r.cfUser,
          cfPakar: r.cfPakar,
          ket: r.ket,
        })),
      });
    }
  }

  // Sort descending by CF
  results.sort((a, b) => b.cfFinal - a.cfFinal);

  return results;
}

// ─── Utility: human-readable CF label ────────────────────────────────

export function getCFLabel(cf: number): string {
  if (cf >= 0.95) return "Pasti (Definitely)";
  if (cf >= 0.75) return "Hampir Pasti (Almost Certainly)";
  if (cf >= 0.55) return "Kemungkinan Besar (Probably)";
  if (cf >= 0.35) return "Barangkali (Maybe)";
  if (cf >= 0.2) return "Sedikit Mendukung (Unknown+)";
  return "Tidak cukup bukti";
}

// ─── Treatment / solution database ───────────────────────────────────

/**
 * Get treatment data for a given disease ID from knowledge base. Returns a safe default if not found.
 */
export function getTreatment(penyakitId: string): Treatment {
  const penyakitList: Penyakit[] = knowledgeBase.penyakit as Penyakit[];
  const penyakit = penyakitList.find((p) => p.id === penyakitId);
  
  return (
    penyakit?.solusi ?? {
      penanganan: ["Konsultasikan dengan petugas penyuluh pertanian (PPL) terdekat."],
      pencegahan: ["Terapkan budidaya tanaman sehat dan pantau sawah secara rutin."],
    }
  );
}
