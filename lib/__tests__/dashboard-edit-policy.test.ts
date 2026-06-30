import { describe, expect, it } from "vitest";

import {
  canDirectEditDashboardField,
  getDirectEditRestrictionReason,
} from "@/lib/dashboard-edit-policy";

describe("dashboard direct edit policy", () => {
  it("tetap mengizinkan edit langsung untuk field deskriptif yang aman", () => {
    expect(canDirectEditDashboardField("gejalaLabel")).toBe(true);
    expect(canDirectEditDashboardField("penyakitNama")).toBe(true);
    expect(canDirectEditDashboardField("solusi")).toBe(true);
    expect(canDirectEditDashboardField("threshold")).toBe(true);
  });

  it("memblokir edit langsung untuk field struktural dan matriks CF", () => {
    expect(canDirectEditDashboardField("gejalaId")).toBe(false);
    expect(canDirectEditDashboardField("gejalaKelompok")).toBe(false);
    expect(canDirectEditDashboardField("createPenyakit")).toBe(false);
    expect(canDirectEditDashboardField("penyakitJenis")).toBe(false);
    expect(canDirectEditDashboardField("cfRule")).toBe(false);
  });

  it("menyediakan alasan pembatasan untuk field sensitif", () => {
    expect(getDirectEditRestrictionReason("gejalaId")).toContain("tab usulan");
    expect(getDirectEditRestrictionReason("cfRule")).toContain("reasoning");
  });
});
