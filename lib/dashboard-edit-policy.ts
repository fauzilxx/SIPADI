export type DashboardDirectEditField =
  | "knowledgeBaseMeta"
  | "threshold"
  | "gejalaId"
  | "gejalaLabel"
  | "gejalaKelompok"
  | "createGejala"
  | "penyakitId"
  | "penyakitNama"
  | "penyakitJenis"
  | "penyakitOrganisme"
  | "createPenyakit"
  | "cfRule"
  | "solusi"
  | "pencegahan";

export function canDirectEditDashboardField(
  field: DashboardDirectEditField
) {
  switch (field) {
    case "knowledgeBaseMeta":
    case "threshold":
    case "gejalaId":
    case "gejalaLabel":
    case "gejalaKelompok":
    case "createGejala":
    case "penyakitId":
    case "penyakitNama":
    case "penyakitJenis":
    case "penyakitOrganisme":
    case "createPenyakit":
    case "cfRule":
    case "solusi":
    case "pencegahan":
      return true;
  }
}

export function getDirectEditRestrictionReason(
  field: Exclude<
    DashboardDirectEditField,
    | "knowledgeBaseMeta"
    | "threshold"
    | "gejalaLabel"
    | "penyakitNama"
    | "penyakitOrganisme"
    | "solusi"
    | "pencegahan"
  >
) {
  switch (field) {
    case "gejalaId":
    case "gejalaKelompok":
    case "createGejala":
    case "penyakitId":
    case "penyakitJenis":
    case "createPenyakit":
      return "Perubahan struktur knowledge base diarahkan lewat tab usulan agar bisa direview sebelum diterapkan.";
    case "cfRule":
      return "Perubahan matriks CF diarahkan lewat tab usulan agar perubahan reasoning tetap terkontrol dan terdokumentasi.";
  }
}
