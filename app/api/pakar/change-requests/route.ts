import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  getSessionCookieName,
  hasDashboardRole,
  verifySessionToken,
} from "@/lib/expert-auth";
import {
  applyApprovedExpertChangeRequest,
  readExpertChangeRequestsFile,
  reviewExpertChangeRequest,
  saveExpertChangeRequest,
} from "@/lib/expert-change-requests";

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

  try {
    const data = await readExpertChangeRequestsFile();
    return NextResponse.json({
      success: true,
      requests: data.requests,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat usulan perubahan pakar.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const result = await saveExpertChangeRequest(payload, {
      username: session.username,
      role: session.role,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Usulan perubahan belum bisa disimpan.",
          errors: result.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Usulan perubahan berhasil disimpan.",
      request: result.data,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat menyimpan usulan perubahan.",
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
        message: "Hanya admin yang dapat meninjau usulan perubahan pakar.",
      },
      { status: 403 }
    );
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const result = await reviewExpertChangeRequest(payload, session.username);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Status usulan perubahan belum bisa diperbarui.",
          errors: result.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Status usulan perubahan berhasil diperbarui.",
      request: result.data,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memperbarui usulan perubahan.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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
        message: "Hanya admin yang dapat menerapkan usulan perubahan pakar.",
      },
      { status: 403 }
    );
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const result = await applyApprovedExpertChangeRequest(
      payload,
      session.username
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Usulan perubahan belum bisa diterapkan ke knowledge base.",
          errors: result.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Usulan perubahan berhasil diterapkan ke knowledge base.",
      request: result.data,
      knowledgeBaseData: result.knowledgeBaseData,
      applicationSummary: result.applicationSummary,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat menerapkan usulan perubahan.",
      },
      { status: 500 }
    );
  }
}
