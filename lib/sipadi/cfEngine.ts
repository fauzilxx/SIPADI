import { knowledgeBase } from "./knowledgeBase";
import { type Evidence, type HasilDiagnosis } from "./types";

function kombinasikanCF(cf1: number, cf2: number): number {
  if (cf1 >= 0 && cf2 >= 0) {
    return cf1 + cf2 * (1 - cf1);
  }
  if (cf1 < 0 && cf2 < 0) {
    return cf1 + cf2 * (1 + cf1);
  }
  return (cf1 + cf2) / (1 - Math.min(Math.abs(cf1), Math.abs(cf2)));
}

export function diagnosis(evidenceList: Evidence[]): HasilDiagnosis[] {
  if (evidenceList.length === 0) return [];

  const hasil: HasilDiagnosis[] = [];

  for (const penyakit of knowledgeBase.penyakit) {
    const cfValues: number[] = [];

    for (const evidence of evidenceList) {
      const aturan = penyakit.aturan.find(
        (a) => a.gejala_id === evidence.gejalaId
      );
      if (!aturan) continue;

      const cfKombinasi = aturan.cf * evidence.cfUser;
      cfValues.push(cfKombinasi);
    }

    if (cfValues.length === 0) continue;

    let cfTotal = cfValues[0];
    for (let i = 1; i < cfValues.length; i++) {
      cfTotal = kombinasikanCF(cfTotal, cfValues[i]);
    }

    cfTotal = Math.max(-1, Math.min(1, cfTotal));

    if (cfTotal >= 0.2) {
      hasil.push({
        penyakitId: penyakit.id,
        nama: penyakit.nama,
        jenis: penyakit.jenis,
        cfTotal,
        organisme: penyakit.organisme,
        fase_rentan: penyakit.fase_rentan,
        rekomendasi: penyakit.rekomendasi,
      });
    }
  }

  return hasil.sort((a, b) => b.cfTotal - a.cfTotal);
}
