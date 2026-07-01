import type { DiagnosisResult } from "@/lib/diagnosis";

export default function AlternativeResults({
  results,
}: {
  results: DiagnosisResult[];
}) {
  if (results.length <= 1) {
    return null;
  }

  return (
    <div className="mt-16 border-t border-gray-200 pt-8">
      <h4 className="mb-4 text-center text-sm font-bold uppercase tracking-wider text-gray-500">
        Kemungkinan Diagnosis Lain
      </h4>
      <div className="flex flex-wrap justify-center gap-3">
        {results.slice(1).map((result) => (
          <div
            key={result.penyakitId}
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2"
          >
            <span className="text-sm font-bold text-[#154212]">
              {result.nama}
            </span>
            <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
              {result.cfPercentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
