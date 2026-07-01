import { NextRequest, NextResponse } from "next/server";
import { diagnosis } from "@/lib/sipadi/cfEngine";
import { type Evidence } from "@/lib/sipadi/types";

interface RequestBody {
  evidence: Evidence[];
}

function isValidEvidence(e: unknown): e is Evidence {
  if (!e || typeof e !== "object") return false;
  const obj = e as Record<string, unknown>;
  return (
    typeof obj.gejalaId === "string" &&
    typeof obj.cfUser === "number" &&
    obj.cfUser >= -1 &&
    obj.cfUser <= 1
  );
}

export async function POST(req: NextRequest) {
  let body: RequestBody;

  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { error: "Request body bukan JSON valid" },
      { status: 400 }
    );
  }

  if (!Array.isArray(body.evidence)) {
    return NextResponse.json(
      { error: 'Field "evidence" harus berupa array' },
      { status: 400 }
    );
  }

  if (!body.evidence.every(isValidEvidence)) {
    return NextResponse.json(
      {
        error:
          "Setiap item evidence harus memiliki gejalaId (string) dan cfUser (number antara -1 dan 1)",
      },
      { status: 400 }
    );
  }

  const hasil = diagnosis(body.evidence);

  return NextResponse.json({ hasil });
}
