export default function PublicSiteFooter() {
  return (
    <footer className="bg-[#BAD36F] rounded-t-[60px] md:rounded-t-[80px] mt-auto w-full">
      <div className="w-full px-4 sm:px-6 lg:px-12 py-10 md:py-14">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {/* Left Column: Title & Copyright */}
          <div className="flex flex-col gap-3">
            <div className="text-green-dark font-bold text-lg">
              Sistem Pakar Diagnosa Padi
            </div>
            <div className="text-xs sm:text-sm text-green-dark/80 font-medium leading-relaxed">
              <p>© 2026 SIPADI - Sistem Pakar Diagnosa Padi .</p>
            </div>
          </div>

          {/* Right Column: Links */}
          <div className="flex items-center gap-8 text-sm text-green-dark font-semibold">
            <a
              href="#"
              className="hover:text-green-dark/80 transition-colors"
            >
              Tentang Kami
            </a>
            <a
              href="#"
              className="hover:text-green-dark/80 transition-colors"
            >
              Bantuan
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
