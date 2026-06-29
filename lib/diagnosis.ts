import {
  getGejalaMap,
  getPenyakitList,
  getThreshold,
  type SelectedGejalaInput,
} from "@/lib/knowledge-base";

export interface DiagnosisResult {
  penyakitId: string;
  nama: string;
  jenis: "hama" | "penyakit";
  cfFinal: number;
  cfPercentage: number;
  positiveMatchCount: number;
  negativeMatchCount: number;
  supportStrength: "strong" | "moderate";
  matchedGejala: {
    id: string;
    label: string;
    cf: number;
    cfUser: number;
    cfPakar: number;
    ket: string;
    matchType: "support" | "conflict";
  }[];
}

const DEFINITIVE_SINGLE_SUPPORT_THRESHOLD = 0.7;
const MIN_POSITIVE_WEIGHT = 0.1;

export function combineCF(cf1: number, cf2: number): number {
  if (cf1 >= 0 && cf2 >= 0) {
    return cf1 + cf2 * (1 - cf1);
  }

  if (cf1 < 0 && cf2 < 0) {
    return cf1 + cf2 * (1 + cf1);
  }

  const denominator = 1 - Math.min(Math.abs(cf1), Math.abs(cf2));
  if (denominator === 0) return 0;

  return (cf1 + cf2) / denominator;
}

export function diagnose(selectedGejala: SelectedGejalaInput[]): DiagnosisResult[] {
  const threshold = getThreshold();
  const penyakitList = getPenyakitList();
  const gejalaMap = getGejalaMap();

  const selectedMap = new Map<string, number>();
  for (const selected of selectedGejala) {
    selectedMap.set(selected.id, selected.cfUser);
  }

  const results: DiagnosisResult[] = [];

  for (const penyakit of penyakitList) {
    const matchedRules = penyakit.aturan
      .filter((rule) => selectedMap.has(rule.gejala_id))
      .map((rule) => ({
        ...rule,
        cfUser: selectedMap.get(rule.gejala_id)!,
        cfPakar: rule.cf,
        cfWeighted: rule.cf * selectedMap.get(rule.gejala_id)!,
      }));

    if (matchedRules.length === 0) continue;

    let cfCombined = matchedRules[0].cfWeighted;
    for (let index = 1; index < matchedRules.length; index++) {
      cfCombined = combineCF(cfCombined, matchedRules[index].cfWeighted);
    }

    cfCombined = Math.max(-1, Math.min(1, cfCombined));

    const positiveMatches = matchedRules.filter(
      (rule) => rule.cfWeighted >= MIN_POSITIVE_WEIGHT
    );
    const negativeMatches = matchedRules.filter((rule) => rule.cfWeighted < 0);
    const strongestPositive = positiveMatches.reduce(
      (current, rule) => Math.max(current, rule.cfWeighted),
      0
    );
    const passesSupportGate =
      positiveMatches.length >= 2 ||
      strongestPositive >= DEFINITIVE_SINGLE_SUPPORT_THRESHOLD;

    if (cfCombined >= threshold && passesSupportGate) {
      results.push({
        penyakitId: penyakit.id,
        nama: penyakit.nama,
        jenis: penyakit.jenis,
        cfFinal: cfCombined,
        cfPercentage: Math.round(cfCombined * 100),
        positiveMatchCount: positiveMatches.length,
        negativeMatchCount: negativeMatches.length,
        supportStrength:
          positiveMatches.length >= 2 ? "strong" : "moderate",
        matchedGejala: matchedRules.map((rule) => ({
          id: rule.gejala_id,
          label: gejalaMap.get(rule.gejala_id)?.label ?? rule.gejala_id,
          cf: rule.cfWeighted,
          cfUser: rule.cfUser,
          cfPakar: rule.cfPakar,
          ket: rule.ket,
          matchType: rule.cfWeighted >= 0 ? "support" : "conflict",
        })),
      });
    }
  }

  results.sort((left, right) => {
    if (right.cfFinal !== left.cfFinal) {
      return right.cfFinal - left.cfFinal;
    }

    return right.positiveMatchCount - left.positiveMatchCount;
  });

  return results;
}

export function getCFLabel(cf: number): string {
  if (cf >= 0.95) return "Pasti (Definitely)";
  if (cf >= 0.75) return "Hampir Pasti (Almost Certainly)";
  if (cf >= 0.55) return "Kemungkinan Besar (Probably)";
  if (cf >= 0.35) return "Barangkali (Maybe)";
  if (cf >= 0.2) return "Sedikit Mendukung (Unknown+)";
  return "Tidak cukup bukti";
}
