import { NextResponse } from "next/server";

import {
  authenticateDashboardUser,
  createSessionToken,
  getSessionCookieName,
  getSessionCookieOptions,
} from "@/lib/expert-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
    };

    const username = body.username?.trim() ?? "";
    const password = body.password ?? "";
    const user = authenticateDashboardUser(username, password);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Username atau password salah.",
        },
        { status: 401 }
      );
    }

    const token = createSessionToken(user.username, user.role);
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil.",
      role: user.role,
    });

    response.cookies.set(
      getSessionCookieName(),
      token,
      getSessionCookieOptions()
    );

    return response;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memproses login.",
      },
      { status: 500 }
    );
  }
}
