import { describe, expect, it } from "vitest";

import { combineCF, diagnose } from "@/lib/diagnosis";

describe("combineCF", () => {
  it("menggabungkan CF positif sesuai rumus", () => {
    expect(combineCF(0.8, 0.6)).toBeCloseTo(0.92);
  });

  it("menggabungkan CF beda tanda sesuai rumus", () => {
    expect(combineCF(0.8, -0.4)).toBeCloseTo(0.6666666667);
  });
});

describe("diagnose", () => {
  it("menghasilkan diagnosis kuat untuk gejala WBC yang relevan", () => {
    const results = diagnose([
      { id: "G19", cfUser: 1 },
      { id: "G24", cfUser: 0.8 },
      { id: "G26", cfUser: 0.8 },
    ]);

    expect(results[0]?.penyakitId).toBe("P01");
    expect(results[0]?.positiveMatchCount).toBeGreaterThanOrEqual(2);
  });

  it("menahan diagnosis jika hanya ada satu gejala lemah", () => {
    const results = diagnose([{ id: "G25", cfUser: 0.5 }]);

    expect(results).toHaveLength(0);
  });

  it("tetap meloloskan satu gejala yang sangat definitif", () => {
    const results = diagnose([{ id: "G20", cfUser: 1 }]);

    expect(results[0]?.penyakitId).toBe("P03");
    expect(results[0]?.supportStrength).toBe("moderate");
  });
});
