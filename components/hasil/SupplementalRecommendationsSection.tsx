import Image from "next/image";

import type { SupplementalRecommendation } from "@/components/hasil/types";

const marketplaceLinkEntries = [
  { label: "Shopee", key: "shopee" },
  { label: "Tokopedia", key: "tokopedia" },
  { label: "Blibli", key: "blibli" },
] as const;

const solutionSections = [
  { key: "kimia", title: "Solusi Kimia" },
  { key: "mekanis", title: "Solusi Mekanis" },
  { key: "biologis", title: "Solusi Biologis" },
] as const;

export default function SupplementalRecommendationsSection({
  recommendation,
}: {
  recommendation: SupplementalRecommendation;
}) {
  const hasWarnings =
    recommendation.unresolvedMarketplaceProductIds.length > 0 ||
    recommendation.unresolvedNonChemicalControlIds.length > 0 ||
    recommendation.missingMarketplaceProductImageIds.length > 0 ||
    recommendation.missingNonChemicalImageIds.length > 0;

  return (
    <div className="space-y-6">
      {hasWarnings && <SupplementalWarning recommendation={recommendation} />}

      <div className="rounded-[24px] border border-[#e3ecd8] bg-white p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="mb-6">
          <h3 className="text-[20px] font-bold text-[#154212]">
            Rekomendasi Produk dan Pengendali Relevan
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Berikut ringkasan cara pengendalian yang dapat dipertimbangkan untuk{" "}
            <strong>{recommendation.nama}</strong>, mulai dari tindakan kimia,
            mekanis, hingga biologis.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {solutionSections.map((section) => (
            <div
              key={section.key}
              className="rounded-[20px] bg-[#f8faf6] p-5"
            >
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#154212]">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {recommendation.solusi[section.key].map((item, index) => (
                  <li
                    key={`${section.key}-${index}`}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#7a9a28]" />
                    <span className="text-sm leading-relaxed text-[#3a4435]">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {recommendation.productIds.marketplace.length > 0 ? (
        <MarketplaceProductsSection recommendation={recommendation} />
      ) : null}

      {recommendation.productIds.nonKimia.length > 0 ? (
        <NonChemicalControlsSection recommendation={recommendation} />
      ) : null}
    </div>
  );
}

function SupplementalWarning({
  recommendation,
}: {
  recommendation: SupplementalRecommendation;
}) {
  return (
    <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-6 py-5 text-sm text-amber-900">
      <h3 className="mb-3 text-base font-bold text-[#154212]">
        Beberapa tautan rekomendasi belum lengkap
      </h3>
      <div className="space-y-2 leading-relaxed">
        {recommendation.unresolvedMarketplaceProductIds.length > 0 && (
          <p>
            Produk marketplace yang belum ditemukan:{" "}
            {recommendation.unresolvedMarketplaceProductIds.join(", ")}
          </p>
        )}
        {recommendation.unresolvedNonChemicalControlIds.length > 0 && (
          <p>
            Pengendali non-kimia yang belum ditemukan:{" "}
            {recommendation.unresolvedNonChemicalControlIds.join(", ")}
          </p>
        )}
        {recommendation.missingMarketplaceProductImageIds.length > 0 && (
          <p>
            Gambar produk marketplace yang belum tersedia:{" "}
            {recommendation.missingMarketplaceProductImageIds.join(", ")}
          </p>
        )}
        {recommendation.missingNonChemicalImageIds.length > 0 && (
          <p>
            Gambar pengendali non-kimia yang belum tersedia:{" "}
            {recommendation.missingNonChemicalImageIds.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}

function MarketplaceProductsSection({
  recommendation,
}: {
  recommendation: SupplementalRecommendation;
}) {
  return (
    <div className="rounded-[24px] border border-gray-100 bg-white p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <h3 className="mb-2 text-[18px] font-bold text-[#154212]">
        Produk Marketplace Terkait
      </h3>
      <p className="mb-6 text-sm leading-relaxed text-gray-600">
        Daftar ini berisi contoh produk yang bisa Anda pelajari lebih lanjut
        sesuai hasil diagnosis. Selalu baca label, ikuti dosis anjuran, dan
        utamakan penggunaan yang aman di lapangan.
      </p>

      {recommendation.marketplaceProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {recommendation.marketplaceProducts.map((product) => {
            const hasImage =
              !recommendation.missingMarketplaceProductImageIds.includes(
                product.id
              );

            return (
              <div
                key={product.id}
                className="overflow-hidden rounded-[22px] border border-[#e7eee0] bg-[#fcfdfa]"
              >
                <div className="flex flex-col gap-5 p-5 sm:flex-row">
                  <div className="flex h-32 w-full items-center justify-center rounded-[18px] bg-white sm:w-36">
                    {hasImage ? (
                      <div className="relative h-full w-full">
                        <Image
                          src={`/images/bahanaktif+kemasan/${product.imageFileName}`}
                          alt={product.productName}
                          fill
                          sizes="(max-width: 640px) 100vw, 144px"
                          className="rounded-[18px] object-contain p-3"
                        />
                      </div>
                    ) : (
                      <div className="px-4 text-center text-xs font-semibold leading-relaxed text-gray-500">
                        Gambar produk belum tersedia
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="mb-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#7a9a28]">
                        {product.category}
                      </p>
                      <h4 className="mt-1 text-lg font-bold text-[#154212]">
                        {product.productName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Bahan aktif: {product.activeIngredient}
                      </p>
                    </div>

                    <p className="text-sm leading-relaxed text-gray-600">
                      {product.catatanPenggunaan}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {marketplaceLinkEntries.map(({ label, key }) => {
                        const href = product.marketplaceLinks[key];
                        return href ? (
                          <a
                            key={`${product.id}-${label}`}
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-[#154212]/15 bg-white px-3 py-1.5 text-xs font-bold text-[#154212] transition-colors hover:bg-[#eef5e8]"
                          >
                            {label}
                          </a>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyInfo message="Belum ada contoh produk yang ditampilkan untuk hasil diagnosis ini." />
      )}
    </div>
  );
}

function NonChemicalControlsSection({
  recommendation,
}: {
  recommendation: SupplementalRecommendation;
}) {
  return (
    <div className="rounded-[24px] border border-gray-100 bg-white p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <h3 className="mb-2 text-[18px] font-bold text-[#154212]">
        Pengendali Non-Kimia yang Relevan
      </h3>
      <p className="mb-6 text-sm leading-relaxed text-gray-600">
        Bagian ini menampilkan pilihan pengendalian non-kimia yang dapat
        membantu, seperti alat, agen hayati, atau metode lapang pendukung.
      </p>

      {recommendation.nonChemicalControls.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {recommendation.nonChemicalControls.map((item) => {
            const hasImage =
              !item.imageFileName ||
              !recommendation.missingNonChemicalImageIds.includes(item.id);

            return (
              <div
                key={item.id}
                className="rounded-[22px] border border-[#e7eee0] bg-[#fcfdfa] p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row">
                  {item.imageFileName ? (
                    <div className="flex h-28 w-full items-center justify-center rounded-[18px] bg-white sm:w-32">
                      {hasImage ? (
                        <div className="relative h-full w-full">
                          <Image
                            src={`/images/pengendali-non-kimia/${item.imageFileName}`}
                            alt={item.nama}
                            fill
                            sizes="(max-width: 640px) 100vw, 128px"
                            className="rounded-[18px] object-contain p-3"
                          />
                        </div>
                      ) : (
                        <div className="px-4 text-center text-xs font-semibold leading-relaxed text-gray-500">
                          Gambar item belum tersedia
                        </div>
                      )}
                    </div>
                  ) : null}

                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#7a9a28]">
                      {item.jenis}
                    </p>
                    <h4 className="mt-1 text-lg font-bold text-[#154212]">
                      {item.nama}
                    </h4>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">
                      {item.deskripsi}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">
                      {item.catatanPenggunaan}
                    </p>

                    {item.marketplaceSearchLinks && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {marketplaceLinkEntries.map(({ label, key }) => {
                          const href = item.marketplaceSearchLinks?.[key];
                          return href ? (
                            <a
                              key={`${item.id}-${label}`}
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-full border border-[#154212]/15 bg-white px-3 py-1.5 text-xs font-bold text-[#154212] transition-colors hover:bg-[#eef5e8]"
                            >
                              {label}
                            </a>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyInfo message="Belum ada rekomendasi pengendalian non-kimia yang ditampilkan untuk hasil diagnosis ini." />
      )}
    </div>
  );
}

function EmptyInfo({ message }: { message: string }) {
  return (
    <div className="rounded-[20px] border border-dashed border-[#BAD36F]/40 bg-[#fafff0] px-6 py-6 text-sm leading-relaxed text-gray-600">
      {message}
    </div>
  );
}
