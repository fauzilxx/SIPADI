# Implementasi Dashboard Pakar

Dokumen ini merangkum arsitektur dashboard pakar/admin SIPADI per 30 Juni 2026.

## Peran

- `pakar`
  - dapat login ke dashboard
  - dapat melihat ringkasan dasar
  - dapat mengajukan usulan perubahan knowledge base
- `admin`
  - dapat login ke dashboard
  - dapat mereview feedback petani
  - dapat mereview usulan pakar
  - dapat menerapkan usulan approved ke knowledge base
  - tetap dapat mengedit dan menyimpan knowledge base secara langsung

## Alur Usulan Perubahan

1. Pakar membuka tab `Usulan Pakar`.
2. Pakar mengirim usulan dengan salah satu tipe:
   - `general`
   - `add_gejala`
   - `revise_aturan`
   - `revise_solusi`
   - `revise_pencegahan`
3. Untuk tipe terstruktur, dashboard mengirim `structuredPayload` ke backend.
4. Backend menyimpan request ke `data/expert_change_requests.json` beserta metadata pengusul.
5. Admin mereview request dan memberi status `pending`, `approved`, atau `rejected`.
6. Jika request `approved` dan memiliki payload terstruktur, admin dapat menjalankan apply ke knowledge base.
7. Backend:
   - membaca knowledge base aktif
   - menerapkan perubahan terstruktur
   - memvalidasi hasil
   - membuat backup knowledge base
   - menulis file knowledge base baru
   - menandai request sebagai `applied`

## Audit yang Tersimpan pada Request

Setiap request kini menyimpan informasi:

- `submittedByUsername`
- `submittedByRole`
- `reviewedByUsername`
- `reviewedAt`
- `appliedByUsername`
- `appliedAt`
- `applicationSummary`

## Catatan Batasan Saat Ini

- Tipe `general` tetap bersifat catatan/manual dan tidak bisa auto-apply.
- Penyimpanan masih berbasis file JSON lokal, sehingga cocok untuk demo/dev dan single-instance.
- Edit knowledge base langsung oleh admin masih tersedia sebagai jalur cepat terpisah dari flow usulan pakar.
