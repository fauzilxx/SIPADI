import { diagnoseWithKnowledgeBaseData, getCFLabel } from "@/lib/diagnosis";
import { readKnowledgeBaseFile } from "@/lib/expert-kb";
import {
  getKelompokByGejalaIdsFromData,
  getKelompokLabel,
  getTreatmentFromData,
  validateSelectedGejalaWithData,
} from "@/lib/knowledge-base";
import { getHydratedRecommendationByPenyakitIdAsync } from "@/lib/supplemental-content";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const knowledgeBaseData = await readKnowledgeBaseFile();
    const payload = (await request.json()) as {
      selectedGejala?: unknown;
    };

    const validated = validateSelectedGejalaWithData(
      knowledgeBaseData,
      payload.selectedGejala
    );

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

    const results = diagnoseWithKnowledgeBaseData(knowledgeBaseData, validated.data);
    const topResult = results[0] ?? null;
    const selectedKelompok = getKelompokByGejalaIdsFromData(
      knowledgeBaseData,
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
      treatment: topResult
        ? getTreatmentFromData(knowledgeBaseData, topResult.penyakitId)
        : null,
      supplementalRecommendation: topResult
        ? await getHydratedRecommendationByPenyakitIdAsync(topResult.penyakitId)
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
