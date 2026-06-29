import { NextResponse } from "next/server";

import {
  getSessionCookieName,
  getSessionCookieOptions,
} from "@/lib/expert-auth";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logout berhasil.",
  });

  response.cookies.set(getSessionCookieName(), "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });

  return response;
}
