# Implementasi Backend Opsi A

Dokumen ini merangkum alur backend diagnosis SIPADI setelah migrasi ke pola `pertanyaan -> API -> hasil`.

## Ringkasan

- Perhitungan diagnosis dilakukan di `POST /api/diagnosis`.
- Halaman `/hasil` tidak lagi menghitung diagnosis langsung di client.
- Validasi `selectedGejala` berjalan di backend melalui `lib/knowledge-base.ts`.
- Mesin diagnosis tetap berada di `lib/diagnosis.ts`.
- Hasil diagnosis tertinggi di-hydrate dengan konten tambahan dari:
  - `data/rekomendasi_pencegahan.json`
  - `data/marketplace_produk.json`
  - `data/pengendali_non_kimia.json`

## Alur

1. Pengguna memilih kelompok dan gejala pada `/pertanyaan`.
2. Pilihan gejala disimpan sementara ke `sessionStorage`.
3. Halaman `/hasil` mengirim payload ke `POST /api/diagnosis`.
4. Backend memvalidasi payload, menjalankan `diagnose`, lalu menyiapkan:
   - daftar hasil diagnosis
   - top result
   - label CF
   - treatment dari knowledge base
   - supplemental recommendation ter-hydrate
5. Response dikembalikan ke `/hasil` untuk dirender.

## Catatan Penting

- `data/knowledge_base_v2.json` tetap menjadi sumber utama aturan diagnosis.
- File JSON supplemental tidak menggantikan knowledge base inti.
- Semua validasi input diagnosis harus tetap lewat backend.
