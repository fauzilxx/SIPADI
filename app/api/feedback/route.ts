import {
  readPublicFeedbackCards,
  readDiagnosisFeedbackSummary,
  saveDiagnosisFeedback,
} from "@/lib/diagnosis-feedback";

export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await readDiagnosisFeedbackSummary();
    const publicCards = await readPublicFeedbackCards();

    return Response.json({
      success: true,
      summary: result.summary,
      totalFeedback: result.latestFeedbackCount,
      publicCards,
    });
  } catch (err) {
    console.error("[feedback/route] GET error:", err);
    return Response.json(
      {
        success: false,
        message: "Gagal memuat ringkasan feedback diagnosis.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const result = await saveDiagnosisFeedback(payload);

    if (!result.success) {
      return Response.json(
        {
          success: false,
          message: "Feedback belum bisa disimpan.",
          errors: result.errors,
        },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      message: "Terima kasih, feedback Anda berhasil disimpan.",
      feedback: result.data,
      summary: result.summary,
    });
  } catch (err) {
    console.error("[feedback/route] POST error:", err);
    return Response.json(
      {
        success: false,
        message: "Terjadi kesalahan saat menyimpan feedback.",
        detail:
          process.env.NODE_ENV === "development" && err instanceof Error
            ? err.message
            : undefined,
      },
      { status: 500 }
    );
  }
}
