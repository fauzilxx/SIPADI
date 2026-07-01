import { describe, expect, it } from "vitest";

import {
  canDirectEditDashboardField,
  getDirectEditRestrictionReason,
} from "@/lib/dashboard-edit-policy";

describe("dashboard direct edit policy", () => {
  it("mengizinkan edit langsung untuk seluruh field dashboard admin", () => {
    expect(canDirectEditDashboardField("gejalaLabel")).toBe(true);
    expect(canDirectEditDashboardField("gejalaId")).toBe(true);
    expect(canDirectEditDashboardField("gejalaKelompok")).toBe(true);
    expect(canDirectEditDashboardField("penyakitNama")).toBe(true);
    expect(canDirectEditDashboardField("penyakitId")).toBe(true);
    expect(canDirectEditDashboardField("penyakitJenis")).toBe(true);
    expect(canDirectEditDashboardField("createPenyakit")).toBe(true);
    expect(canDirectEditDashboardField("createGejala")).toBe(true);
    expect(canDirectEditDashboardField("cfRule")).toBe(true);
    expect(canDirectEditDashboardField("solusi")).toBe(true);
    expect(canDirectEditDashboardField("threshold")).toBe(true);
  });

  it("menyediakan alasan pembatasan untuk field sensitif", () => {
    expect(getDirectEditRestrictionReason("gejalaId")).toContain("tab usulan");
    expect(getDirectEditRestrictionReason("cfRule")).toContain("reasoning");
  });
});
