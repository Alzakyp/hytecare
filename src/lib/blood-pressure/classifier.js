// KMK No. HK.01.07/MENKES/303/2026, Tabel 2 (pengukuran di klinik).
// ponytail: Klasifikasi catatan tunggal bukan diagnosis; tinjau ulang sebelum pemakaian klinis.
export function classifyBloodPressure(systolic, diastolic) {
  if (![systolic, diastolic].every((n) => Number.isFinite(n) && n > 0)) throw new Error('Angka tekanan darah tidak valid');
  if (systolic >= 180 || diastolic >= 110) return { key: 'derajat_3', label: 'Hipertensi derajat 3', tone: 'red', isVeryHigh: true };
  if (systolic >= 160 || diastolic >= 100) return { key: 'derajat_2', label: 'Hipertensi derajat 2', tone: 'red', isVeryHigh: false };
  if (systolic >= 140 || diastolic >= 90) return { key: 'derajat_1', label: 'Hipertensi derajat 1', tone: 'orange', isVeryHigh: false };
  // Nilai rendah bukan kategori pada Tabel 2; dipisahkan hanya untuk saran ukur ulang.
  if (systolic < 90 || diastolic < 60) return { key: 'rendah', label: 'Nilai rendah', tone: 'blue', isVeryHigh: false };
  if (systolic >= 120 || diastolic >= 70) return { key: 'meningkat', label: 'Tekanan darah meningkat', tone: 'amber', isVeryHigh: false };
  return { key: 'tidak_meningkat', label: 'Tidak meningkat', tone: 'teal', isVeryHigh: false };
}
