import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  getSessionCookieName,
  hasDashboardRole,
  verifySessionToken,
} from "@/lib/expert-auth";
import { saveKnowledgeBaseFile } from "@/lib/expert-kb";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(getSessionCookieName())?.value;
  const session = verifySessionToken(sessionToken);

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
        message: "Hanya admin yang dapat menyimpan knowledge base.",
      },
      { status: 403 }
    );
  }

  try {
    const body = (await request.json()) as {
      data?: unknown;
    };

    const result = await saveKnowledgeBaseFile(body.data);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi knowledge base gagal.",
          errors: result.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Knowledge base berhasil disimpan.",
      data: result.data,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat menyimpan knowledge base.",
      },
      { status: 500 }
    );
  }
}
