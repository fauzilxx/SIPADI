import { NextResponse } from "next/server";

import {
  createSessionToken,
  getExpertCredentials,
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
    const expected = getExpertCredentials();

    if (username !== expected.username || password !== expected.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Username atau password salah.",
        },
        { status: 401 }
      );
    }

    const token = createSessionToken(username);
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil.",
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
