"use client";

import { useActionState } from "react";
import { createReading, type ReadingState } from "@/lib/blood-pressure/actions";
import { BloodPressureResultCard } from "./blood-pressure-result-card";
import { dangerSymptoms } from "@/lib/blood-pressure/guidance.js";
import { Save } from "lucide-react";

export function BloodPressureForm() {
  const [state, action, pending] = useActionState<ReadingState, FormData>(createReading, {});
  if (state.result) return <BloodPressureResultCard result={state.result} />;
  return <form action={action} className="reading-form">
    <div className="reading-form-intro"><p className="dashboard-eyebrow">CATAT PENGUKURAN</p><h1 className="text-3xl font-bold mt-2">Tekanan Darah</h1><p className="mt-2">Masukkan angka yang terlihat pada alat ukur.</p></div>
    <div className="reading-fields">
      <label><span>Sistolik <small>mmHg</small></span><input name="systolic" type="number" inputMode="numeric" min="50" max="300" step="1" required placeholder="120" /></label>
      <label><span>Diastolik <small>mmHg</small></span><input name="diastolic" type="number" inputMode="numeric" min="30" max="200" step="1" required placeholder="80" /></label>
      <label><span>Detak jantung <small>bpm · opsional</small></span><input name="heart_rate" type="number" inputMode="numeric" min="30" max="250" step="1" placeholder="72" /></label>
      <label><span>Tanggal &amp; waktu</span><input name="measured_at" type="datetime-local" required defaultValue={new Date().toISOString().slice(0,16)} /></label>
      <label className="full"><span>Catatan <small>opsional</small></span><textarea name="notes" rows={3} maxLength={1000} placeholder="Misalnya: setelah beristirahat" /></label>
    </div>
    <fieldset className="symptoms-field"><legend>Apakah Anda merasakan tanda bahaya?</legend><p className="mb-3 text-sm">{dangerSymptoms.join(", ")}. Jika ya, cari pertolongan medis segera.</p><label><input type="checkbox" name="has_red_flags" value="true" /><span>Ya, saya merasakan salah satu tanda bahaya</span></label></fieldset>
    {state.error && <p className="form-error" role="alert">{state.error}</p>}
    <button type="submit" disabled={pending} aria-busy={pending} className="auth-button w-full"><Save size={19} aria-hidden="true" />{pending ? <>Menyimpan… <span className="button-spinner" aria-hidden="true" /></> : "Simpan pengukuran"}</button>
    <p className="text-xs text-slate-600">HyteCare bukan alat diagnosis. Nilai tinggi atau gejala berat memerlukan evaluasi tenaga kesehatan.</p>
  </form>;
}
