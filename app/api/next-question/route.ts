import { NextRequest, NextResponse } from "next/server";
import {
  nextQuestion,
  pilihKelompok,
  selesaikanKelompok,
  initialWizardState,
  KELOMPOK_INFO,
  type WizardState,
  type KelompokId,
} from "@/lib/sipadi/nextQuestion";
import { diagnosis } from "@/lib/sipadi/cfEngine";

type Aksi = "next" | "pilih_kelompok" | "selesaikan_kelompok";

interface RequestBody {
  state?: WizardState;
  aksi?: Aksi;
  kelompok?: KelompokId;
}

const VALID_KELOMPOK = new Set<KelompokId>(["A", "B", "C", "D", "E"]);

function isValidKelompokId(k: unknown): k is KelompokId {
  return typeof k === "string" && VALID_KELOMPOK.has(k as KelompokId);
}

function isValidWizardState(s: unknown): s is WizardState {
  if (!s || typeof s !== "object") return false;
  const obj = s as Record<string, unknown>;
  return (
    Array.isArray(obj.evidence) &&
    Array.isArray(obj.kelompokSelesai) &&
    (obj.kelompokAktif === null || isValidKelompokId(obj.kelompokAktif))
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

  if (!body.state) {
    const state = initialWizardState();
    const step = nextQuestion(state);
    return NextResponse.json({ step, state });
  }

  if (!isValidWizardState(body.state)) {
    return NextResponse.json(
      { error: "state tidak valid" },
      { status: 400 }
    );
  }

  const aksi: Aksi = body.aksi ?? "next";
  let state: WizardState = body.state;

  switch (aksi) {
    case "pilih_kelompok": {
      if (!isValidKelompokId(body.kelompok)) {
        return NextResponse.json(
          { error: 'field "kelompok" harus berisi salah satu dari: A, B, C, D, E' },
          { status: 400 }
        );
      }
      if (state.kelompokSelesai.includes(body.kelompok)) {
        return NextResponse.json(
          { error: `Kelompok ${KELOMPOK_INFO[body.kelompok].label} sudah dijawab` },
          { status: 400 }
        );
      }
      state = pilihKelompok(state, body.kelompok);
      break;
    }
    case "selesaikan_kelompok": {
      if (state.kelompokAktif === null) {
        return NextResponse.json(
          { error: "Tidak ada kelompokAktif yang bisa diselesaikan" },
          { status: 400 }
        );
      }
      state = selesaikanKelompok(state);
      break;
    }
    case "next":
    default:
      break;
  }

  const step = nextQuestion(state);

  let preview = undefined;
  if (state.evidence.length > 0) {
    try {
      const hasilPreview = diagnosis(state.evidence);
      if (hasilPreview.length > 0) preview = hasilPreview;
    } catch {
      preview = undefined;
    }
  }

  return NextResponse.json({ step, state, preview });
}
