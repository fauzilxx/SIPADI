import Link from "next/link";

export function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fcfdfa]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#BAD36F] border-t-[#154212]" />
        <p className="text-sm font-semibold text-[#154212]">
          Sedang menyiapkan hasil diagnosis...
        </p>
      </div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-[24px] border border-red-100 bg-white p-12 text-center shadow-sm">
      <h3 className="mb-3 text-xl font-bold text-gray-800">
        Diagnosis Belum Bisa Ditampilkan
      </h3>
      <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-gray-500">
        {message}
      </p>
      <Link
        href="/pertanyaan"
        className="inline-flex items-center gap-2 rounded-[12px] bg-[#154212] px-8 py-3.5 font-bold text-white transition-all hover:bg-[#154212]/90"
      >
        Kembali Pilih Gejala
      </Link>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="rounded-[24px] border border-gray-100 bg-white p-12 text-center shadow-sm">
      <h3 className="mb-3 text-xl font-bold text-gray-800">
        Tidak Ditemukan Hasil
      </h3>
      <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-gray-500">
        Gejala yang Anda pilih belum cukup kuat untuk menunjukkan satu masalah
        utama pada tanaman. Silakan kembali, pilih gejala yang paling sesuai
        dengan kondisi di sawah, atau tambahkan gejala lain yang juga terlihat.
      </p>
      <Link
        href="/pertanyaan"
        className="inline-flex items-center gap-2 rounded-[12px] bg-[#154212] px-8 py-3.5 font-bold text-white transition-all hover:bg-[#154212]/90"
      >
        Kembali Pilih Gejala
      </Link>
    </div>
  );
}
