import { diagnose, getCFLabel } from "@/lib/diagnosis";
import {
  getKelompokByGejalaIds,
  getKelompokLabel,
  getTreatment,
  validateSelectedGejala,
} from "@/lib/knowledge-base";
import { getHydratedRecommendationByPenyakitId } from "@/lib/supplemental-content";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      selectedGejala?: unknown;
    };

    const validated = validateSelectedGejala(payload.selectedGejala);

    if (validated.errors.length > 0) {
      return Response.json(
        {
          success: false,
          message: "Input gejala tidak valid.",
          errors: validated.errors,
        },
        { status: 400 }
      );
    }

    const results = diagnose(validated.data);
    const topResult = results[0] ?? null;
    const selectedKelompok = getKelompokByGejalaIds(
      validated.data.map((item) => item.id)
    );

    return Response.json({
      success: true,
      selectedGejala: validated.data,
      selectedKelompok: selectedKelompok.map((id) => ({
        id,
        label: getKelompokLabel(id),
      })),
      totalSelectedGejala: validated.data.length,
      results,
      topResult,
      topResultLabel: topResult ? getCFLabel(topResult.cfFinal) : null,
      treatment: topResult ? getTreatment(topResult.penyakitId) : null,
      supplementalRecommendation: topResult
        ? getHydratedRecommendationByPenyakitId(topResult.penyakitId)
        : null,
      generatedAt: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memproses diagnosis.",
      },
      { status: 500 }
    );
  }
}
