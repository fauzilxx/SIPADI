import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex animate-fade-in-up flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#BAD36F]/30 bg-[#BAD36F]/20 px-4 py-1.5">
              <Image
                src="/icons/thunder_icon.svg"
                alt="Thunder"
                width={10}
                height={12}
                className="h-[12px] w-[10px] object-contain"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-green-dark">
                AI Powered Diagnosis
              </span>
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight text-green-dark sm:text-5xl lg:text-[3.5rem]">
              Solusi Pakar untuk <br className="hidden lg:block" />
              <span className="text-green-accent">Kesehatan Padi</span> Anda.
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-text-muted sm:text-base">
              Melalui{" "}
              <strong className="font-bold text-text-dark">
                SIPADI (Sistem Pakar Diagnosa Padi)
              </strong>
              , Anda dapat mengidentifikasi hama dan penyakit tanaman secara
              akurat dalam hitungan detik. Kami menggunakan algoritma penalaran
              pakar untuk membantu petani mengamankan hasil panen yang melimpah.
            </p>

            <div className="mt-2 flex items-center gap-4">
              <Link
                href="/pertanyaan"
                id="hero-cta-button"
                className="inline-flex items-center gap-2 rounded-xl bg-green-dark px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-dark/95 hover:shadow-lg hover:shadow-green-dark/20"
              >
                Mulai Diagnosa
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="relative animate-fade-in-up animation-delay-200">
            <div className="relative overflow-hidden rounded-[32px] border border-gray-100 bg-white p-3 shadow-xl">
              <Image
                src="/images/padi.png"
                alt="Tanaman padi sehat di sawah"
                width={640}
                height={480}
                className="h-auto w-full rounded-[20px] object-cover"
                preload
              />
            </div>

            <div className="absolute -bottom-6 -left-6 flex animate-float items-center gap-3.5 rounded-[var(--radius-xl)] border border-gray-100 bg-white p-4 shadow-2xl sm:p-5">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#c2f363] shadow-sm">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#154212"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-text-muted">
                  Akurasi Diagnosa
                </p>
                <p className="text-xl font-bold text-green-dark">98.4%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
