import Image from "next/image";

import type { DiagnosisResult } from "@/lib/diagnosis";
import type { PenyakitImageAsset, Treatment } from "@/lib/knowledge-base";

export default function DiagnosisSummarySection({
  topResult,
  topResultLabel,
  totalSelectedGejala,
  selectedKelompok,
  treatment,
  penyakitImage,
}: {
  topResult: DiagnosisResult;
  topResultLabel: string | null | undefined;
  totalSelectedGejala: number | undefined;
  selectedKelompok: { id: string; label: string }[] | undefined;
  treatment: Treatment;
  penyakitImage: PenyakitImageAsset | null;
}) {
  const topSupportGejala = topResult.matchedGejala
    .filter((gejala) => gejala.matchType === "support")
    .sort((a, b) => b.cf - a.cf)
    .slice(0, 5);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="flex flex-col justify-center rounded-[24px] border border-gray-100 bg-white p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] lg:p-10">
          <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="relative h-36 w-full overflow-hidden rounded-[24px] bg-[#eef5e8] sm:h-40 sm:w-40 sm:flex-shrink-0">
              {penyakitImage ? (
                <Image
                  src={penyakitImage.src}
                  alt={penyakitImage.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 160px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-[24px] bg-[#BAD36F]">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#154212"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="8" y="6" width="8" height="14" rx="4" />
                    <path d="M12 2v4" />
                    <path d="M19 10h-3" />
                    <path d="M19 14h-3" />
                    <path d="M19 18h-3" />
                    <path d="M5 10h3" />
                    <path d="M5 14h3" />
                    <path d="M5 18h3" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="mb-1.5 text-2xl font-bold leading-tight text-[#154212] lg:text-[28px]">
                {topResult.nama}
              </h2>
              <p className="text-sm italic text-gray-500">
                {topResult.jenis === "hama" ? "Kategori Hama" : "Kategori Penyakit"}
              </p>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#2d5028] px-4 py-2 text-white">
              <span className="text-sm font-semibold">
                Tingkat Kepercayaan {topResult.cfPercentage}%
              </span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#eef5e8] px-4 py-2 text-[#154212]">
              <span className="text-sm font-semibold">{topResultLabel}</span>
            </div>
          </div>

          <p className="mb-6 text-[15px] leading-relaxed text-gray-600">
            Berdasarkan gejala yang Anda pilih, kondisi padi Anda paling mendekati{" "}
            <strong className="text-[#154212]">{topResult.nama}</strong>. Gunakan
            hasil ini sebagai panduan awal untuk memeriksa tanaman di lapangan dan
            menentukan langkah penanganan yang paling sesuai.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard label="Gejala Dipilih" value={totalSelectedGejala} />
            <StatCard
              label="Gejala Mendukung"
              value={topResult.positiveMatchCount}
            />
            <StatCard
              label="Gejala Konflik"
              value={topResult.negativeMatchCount}
            />
          </div>
        </div>

        <div className="rounded-[24px] border border-dashed border-[#e0e8d8] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <h3 className="mb-4 text-lg font-bold text-[#154212]">
            Kelompok yang Dipilih
          </h3>
          <div className="mb-6 flex flex-wrap gap-3">
            {selectedKelompok?.map((kelompok) => (
              <span
                key={kelompok.id}
                className="rounded-full bg-[#BAD36F]/20 px-4 py-2 text-sm font-semibold text-[#154212]"
              >
                {kelompok.label}
              </span>
            ))}
          </div>

          <h3 className="mb-4 text-lg font-bold text-[#154212]">
            Gejala Paling Berpengaruh
          </h3>
          <div className="space-y-3">
            {topSupportGejala.map((gejala) => (
              <div
                key={gejala.id}
                className="rounded-[16px] border border-gray-100 bg-[#f8faf6] p-4"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-[#154212]">
                    {gejala.label}
                  </p>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#154212]">
                    {Math.round(gejala.cf * 100)}%
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-gray-500">{gejala.ket}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <TreatmentCard
          title="Rekomendasi Penanganan Jangka Pendek"
          items={treatment.penanganan}
        />
        <TreatmentCard
          title="Strategi Pencegahan Jangka Panjang"
          items={treatment.pencegahan}
        />
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number | undefined;
}) {
  return (
    <div className="rounded-[18px] bg-[#f8faf6] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-[#154212]">{value ?? 0}</p>
    </div>
  );
}

function TreatmentCard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-[24px] border border-gray-100 bg-white p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <h3 className="mb-6 text-[17px] font-bold leading-snug text-[#154212]">
        {title}
      </h3>
      <ul className="space-y-4">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#7a9a28]" />
            <span className="text-[14px] font-medium leading-relaxed text-[#3a4435]">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
