export default function PertanyaanHeader() {
  return (
    <>
      <div className="mb-10 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#BAD36F]/30 bg-[#BAD36F]/20 px-4 py-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-green-dark">
            Proses Diagnosa
          </span>
        </div>

        <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-green-dark sm:text-4xl lg:text-[2.75rem]">
          Pilih Kelompok Gejala Terlebih Dahulu
        </h1>
        <p className="mx-auto max-w-3xl text-sm leading-relaxed text-text-muted sm:text-base">
          Alur SIPADI sekarang lebih terarah. Pilih kelompok gejala yang Anda
          lihat, lalu centang gejala spesifik di dalam kelompok tersebut. Anda
          tetap boleh membuka lebih dari satu kelompok sebelum menjalankan
          diagnosis.
        </p>
      </div>

      <div className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <StepCard active number="1" label="Pilih Kelompok" />
        <StepCard number="2" label="Pilih Gejala" />
        <StepCard number="3" label="Hasil Diagnosa" />
      </div>
    </>
  );
}

function StepCard({
  active = false,
  number,
  label,
}: {
  active?: boolean;
  number: string;
  label: string;
}) {
  return (
    <div
      className={`w-full rounded-[12px] px-6 py-4 sm:w-[260px] ${
        active
          ? "border border-[#b8c7b4] bg-[#fffff6] shadow-sm"
          : "bg-[#fffff6]"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full text-base font-bold text-white ${
            active ? "bg-green-dark" : "bg-[#b9c0b5]"
          }`}
        >
          {number}
        </div>
        <span
          className={`text-base font-bold ${
            active ? "text-green-dark" : "text-[#8a9184]"
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
