export function validateReading(input) {
  const integer = (value) => /^\d+$/.test(String(value ?? '').trim()) ? Number(value) : NaN;
  const sys = integer(input.systolic);
  const dia = integer(input.diastolic);
  if (!Number.isInteger(sys) || sys < 50 || sys > 300) return { ok: false, error: 'Sistolik harus berupa angka 50–300 mmHg.' };
  if (!Number.isInteger(dia) || dia < 30 || dia > 200) return { ok: false, error: 'Diastolik harus berupa angka 30–200 mmHg.' };
  if (sys <= dia) return { ok: false, error: 'Sistolik harus lebih tinggi dari diastolik.' };
  let hr = null;
  const rawHr = String(input.heartRate ?? input.heart_rate ?? '').trim();
  if (rawHr !== '') {
    const parsed = integer(rawHr);
    if (!Number.isInteger(parsed) || parsed < 30 || parsed > 250) return { ok: false, error: 'Detak jantung harus antara 30–250 bpm.' };
    hr = parsed;
  }
  const dateVal = new Date(input.measuredAt ?? input.measured_at);
  if (Number.isNaN(dateVal.getTime())) return { ok: false, error: 'Format tanggal/jam tidak valid.' };
  const rawNotes = input.notes ? String(input.notes).trim() : null;
  if (rawNotes && rawNotes.length > 1000) return { ok: false, error: 'Catatan maksimal 1000 karakter.' };
  return { ok: true, value: { systolic: sys, diastolic: dia, heart_rate: hr, measured_at: dateVal.toISOString(), notes: rawNotes } };
}
