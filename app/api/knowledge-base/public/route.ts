import { readKnowledgeBaseFile } from "@/lib/expert-kb";
import {
  getGejalaListFromData,
  getKelompokOptionsFromData,
} from "@/lib/knowledge-base";

export const runtime = "nodejs";

export async function GET() {
  try {
    const knowledgeBaseData = await readKnowledgeBaseFile();

    return Response.json({
      success: true,
      gejala: getGejalaListFromData(knowledgeBaseData),
      kelompokOptions: getKelompokOptionsFromData(knowledgeBaseData),
      generatedAt: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      {
        success: false,
        message: "Gagal memuat knowledge base publik.",
      },
      { status: 500 }
    );
  }
}
