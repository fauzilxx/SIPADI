import Image from "next/image";
import Link from "next/link";

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        <div className="mb-14 text-center animate-fade-in-up md:mb-20">
          <h2
            className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.75rem]"
            style={{ color: "#154212", lineHeight: "40px" }}
          >
            Mengapa Menggunakan SIPADI?
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-text-muted sm:text-lg">
            Platform diagnosa cerdas yang dirancang khusus untuk membantu petani
            Indonesia menjaga kesehatan tanaman padi mereka.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <AiReasoningCard />
          <InstantResultsCard />
          <TreatmentGuideCard />
          <CallToActionCard />
        </div>
      </div>
    </section>
  );
}

function AiReasoningCard() {
  return (
    <div className="group relative overflow-hidden rounded-[var(--radius-xl)] border border-gray-100 bg-white p-7 shadow-sm transition-all duration-300 hover:shadow-xl animate-fade-in-up animation-delay-100 md:p-9 lg:col-span-2">
      <div className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 select-none text-text-dark opacity-[0.06] sm:block">
        <svg width="140" height="140" viewBox="0 0 56 56" fill="currentColor">
          <path d="M19.8677 40.5V35.125C18.6802 34.0417 17.7583 32.776 17.1021 31.3281C16.4458 29.8802 16.1177 28.3542 16.1177 26.75C16.1177 23.625 17.2114 20.9688 19.3989 18.7812C21.5864 16.5938 24.2427 15.5 27.3677 15.5C29.9718 15.5 32.2791 16.2656 34.2896 17.7969C36.3 19.3281 37.6073 21.3229 38.2114 23.7812L39.8364 30.1875C39.9406 30.5833 39.8677 30.9427 39.6177 31.2656C39.3677 31.5885 39.0343 31.75 38.6177 31.75H36.1177V35.5C36.1177 36.1875 35.8729 36.776 35.3833 37.2656C34.8937 37.7552 34.3052 38 33.6177 38H31.1177V40.5H28.6177V35.5H33.6177V29.25H36.9927L35.8052 24.4062C35.326 22.5104 34.3052 20.9688 32.7427 19.7812C31.1802 18.5938 29.3885 18 27.3677 18C24.951 18 22.8885 18.8438 21.1802 20.5312C19.4718 22.2188 18.6177 24.2708 18.6177 26.6875C18.6177 27.9375 18.8729 29.125 19.3833 30.25C19.8937 31.375 20.6177 32.375 21.5552 33.25L22.3677 34V40.5H19.8677ZM26.1177 31.75H28.6177L28.8052 30.1875C28.9718 30.125 29.1229 30.0521 29.2583 29.9688C29.3937 29.8854 29.5135 29.7917 29.6177 29.6875L31.0552 30.3125L32.3052 28.1875L31.0552 27.25C31.0968 27.0833 31.1177 26.9167 31.1177 26.75C31.1177 26.5833 31.0968 26.4167 31.0552 26.25L32.3052 25.3125L31.0552 23.1875L29.6177 23.8125C29.5135 23.7083 29.3937 23.6146 29.2583 23.5312C29.1229 23.4479 28.9718 23.375 28.8052 23.3125L28.6177 21.75H26.1177L25.9302 23.3125C25.7635 23.375 25.6125 23.4479 25.4771 23.5312C25.3416 23.6146 25.2218 23.7083 25.1177 23.8125L23.6802 23.1875L22.4302 25.3125L23.6802 26.25C23.6385 26.4167 23.6177 26.5833 23.6177 26.75C23.6177 26.9167 23.6385 27.0833 23.6802 27.25L22.4302 28.1875L23.6802 30.3125L25.1177 29.6875C25.2218 29.7917 25.3416 29.8854 25.4771 29.9688C25.6125 30.0521 25.7635 30.125 25.9302 30.1875L26.1177 31.75ZM27.3677 28.625C26.8468 28.625 26.4041 28.4427 26.0396 28.0781C25.675 27.7135 25.4927 27.2708 25.4927 26.75C25.4927 26.2292 25.675 25.7865 26.0396 25.4219C26.4041 25.0573 26.8468 24.875 27.3677 24.875C27.8885 24.875 28.3312 25.0573 28.6958 25.4219C29.0604 25.7865 29.2427 26.2292 29.2427 26.75C29.2427 27.2708 29.0604 27.7135 28.6958 28.0781C28.3312 28.4427 27.8885 28.625 27.3677 28.625Z" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="mb-5">
          <Image
            src="/icons/container1_1.svg"
            alt="AI Reasoning"
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
          />
        </div>
        <h3 className="mb-3 text-xl font-bold md:text-2xl" style={{ color: "#154212" }}>
          Penalaran Pakar (AI Reasoning)
        </h3>
        <p className="mb-6 max-w-md text-sm leading-relaxed text-text-muted md:text-base">
          Sistem ini bekerja seperti seorang dokter tanaman. Anda hanya perlu
          menjawab beberapa pertanyaan singkat, dan sistem akan langsung
          mendeteksi masalah pada padi Anda dengan hasil yang akurat.
        </p>
        <Link
          href="/pertanyaan"
          className="group/link inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-85"
          style={{ color: "#154212" }}
        >
          Mulai Diagnosa
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            className="transition-transform group-hover/link:translate-x-1"
          >
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function InstantResultsCard() {
  return (
    <div className="flex flex-col justify-between rounded-[var(--radius-xl)] border border-[#c2f363]/10 bg-[#c2f363]/20 p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-in-up animation-delay-200">
      <div>
        <div className="mb-5">
          <Image
            src="/icons/container2.svg"
            alt="Hasil Instan"
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
          />
        </div>
        <h3 className="mb-2 text-lg font-bold" style={{ color: "#154212" }}>
          Hasil Instan
        </h3>
        <p className="mb-6 text-sm leading-relaxed text-text-muted">
          Dapatkan diagnosis dan saran penanganan hanya dalam kurun waktu kurang
          dari 2 menit.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm shadow-sm ring-2 ring-white select-none">
            P
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm shadow-sm ring-2 ring-white select-none">
            T
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm shadow-sm ring-2 ring-white select-none">
            A
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c2f363] text-xs font-bold text-[#154212] shadow-sm ring-2 ring-white select-none">
            +5k
          </div>
        </div>
        <p className="text-xs leading-snug text-text-muted">
          Dipercaya oleh
          <br />
          <span className="font-semibold text-text-dark">
            ribuan petani lokal
          </span>
        </p>
      </div>
    </div>
  );
}

function TreatmentGuideCard() {
  return (
    <div className="rounded-[var(--radius-xl)] bg-[#e4e3d8] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-in-up animation-delay-300">
      <div className="mb-5">
        <Image
          src="/icons/container3.svg"
          alt="Panduan Penanganan"
          width={56}
          height={56}
          className="h-14 w-14 object-contain"
        />
      </div>
      <h3 className="mb-2 text-lg font-bold text-text-dark">
        Panduan Penanganan
      </h3>
      <p className="text-sm leading-relaxed text-text-muted">
        Bukan sekadar diagnosis. Kami memberikan langkah-langkah praktis
        penanganan kimiawi dan organik yang aman bagi lingkungan.
      </p>
    </div>
  );
}

function CallToActionCard() {
  return (
    <div className="flex flex-col items-center gap-6 rounded-[var(--radius-xl)] border border-[#154212]/10 bg-[#154212]/5 p-7 transition-all duration-300 hover:shadow-xl animate-fade-in-up animation-delay-400 sm:flex-row md:p-9 lg:col-span-2">
      <div className="flex-1">
        <h3 className="mb-3 text-xl font-bold md:text-2xl" style={{ color: "#154212" }}>
          Yuk, Kenali Kondisi Padi Anda!
        </h3>
        <p className="text-sm leading-relaxed text-text-muted">
          Cari tahu masalah pada tanaman padi Anda hanya dengan beberapa klik.
          Mulai diagnosis sekarang untuk mendapatkan penanganan yang cepat dan
          tepat demi hasil panen yang melimpah
        </p>
      </div>
      <div className="w-full flex-shrink-0 overflow-hidden rounded-[var(--radius-lg)] shadow-md sm:w-60 md:w-68">
        <Image
          src="/images/farmer.png"
          alt="Petani memegang tanaman padi"
          width={240}
          height={300}
          className="h-auto w-full object-cover"
        />
      </div>
    </div>
  );
}
