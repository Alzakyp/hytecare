import { classifyBloodPressure } from './classifier.js';

export const dangerSymptoms = ['Nyeri dada', 'Sesak napas', 'Gangguan penglihatan', 'Kejang', 'Penurunan kesadaran', 'Kelumpuhan atau bicara pelo'];

export function getBloodPressureGuidance({ systolic, diastolic, hasRedFlags }) {
  const category = classifyBloodPressure(systolic, diastolic);
  const showEmergencyCall = category.isVeryHigh || hasRedFlags;
  if (hasRedFlags) return { title: 'Cari pertolongan medis segera', message: 'Gejala yang Anda pilih memerlukan penilaian tenaga kesehatan segera. Jangan menunggu aplikasi menegakkan diagnosis.', showEmergencyCall, emergencyNumber: '0341 4372409', symptoms: dangerSymptoms };
  if (category.isVeryHigh) return { title: 'Tekanan darah sangat tinggi', message: 'Ukur ulang dengan benar dan hubungi tenaga kesehatan. Bila muncul tanda bahaya, cari pertolongan medis segera.', showEmergencyCall, emergencyNumber: '0341 4372409', symptoms: dangerSymptoms };
  if (category.key === 'rendah') return { title: 'Nilai mungkin rendah', message: 'Ukur ulang; jika merasa tidak enak badan atau muncul gejala, konsultasikan kepada tenaga kesehatan.', showEmergencyCall: false, emergencyNumber: '0341 4372409', symptoms: dangerSymptoms };
  return { title: 'Pertahankan pencatatan rutin', message: 'Catat hasil pengukuran dan diskusikan pola atau kekhawatiran dengan tenaga kesehatan.', showEmergencyCall: false, emergencyNumber: '0341 4372409', symptoms: dangerSymptoms };
}
