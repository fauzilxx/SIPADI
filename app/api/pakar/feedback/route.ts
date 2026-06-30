import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  readDiagnosisFeedbackFile,
  readDiagnosisFeedbackSummary,
  reviewDiagnosisFeedback,
} from "@/lib/diagnosis-feedback";
import {
  getSessionCookieName,
  hasDashboardRole,
  verifySessionToken,
} from "@/lib/expert-auth";

export const runtime = "nodejs";

async function verifySession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(getSessionCookieName())?.value;
  return verifySessionToken(sessionToken);
}

export async function GET() {
  const session = await verifySession();

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message: "Sesi tidak valid. Silakan login ulang.",
      },
      { status: 401 }
    );
  }

  if (!hasDashboardRole(session, "admin")) {
    return NextResponse.json(
      {
        success: false,
        message: "Hanya admin yang dapat meninjau feedback petani.",
      },
      { status: 403 }
    );
  }

  try {
    const [feedbackData, summaryData] = await Promise.all([
      readDiagnosisFeedbackFile(),
      readDiagnosisFeedbackSummary(),
    ]);

    return NextResponse.json({
      success: true,
      feedback: feedbackData.feedback,
      summary: summaryData.summary,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat feedback petani.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await verifySession();

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message: "Sesi tidak valid. Silakan login ulang.",
      },
      { status: 401 }
    );
  }

  if (!hasDashboardRole(session, "admin")) {
    return NextResponse.json(
      {
        success: false,
        message: "Hanya admin yang dapat memperbarui review feedback petani.",
      },
      { status: 403 }
    );
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const result = await reviewDiagnosisFeedback(payload);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Review feedback belum bisa disimpan.",
          errors: result.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Review feedback berhasil diperbarui.",
      feedback: result.data,
      summary: result.summary,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memperbarui feedback.",
      },
      { status: 500 }
    );
  }
}
