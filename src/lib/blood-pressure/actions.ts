"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/roles";
import { validateReading } from "./validation.js";
import { classifyBloodPressure } from "./classifier.js";
import { getBloodPressureGuidance } from "./guidance.js";

export type ReadingState = {
  error?: string;
  result?: {
    id: string;
    systolic: number;
    diastolic: number;
    heart_rate: number | null;
    measured_at: string;
    notes: string | null;
    category: ReturnType<typeof classifyBloodPressure>;
    guidance: ReturnType<typeof getBloodPressureGuidance>;
  };
};

export async function createReading(_previous: ReadingState, form: FormData): Promise<ReadingState> {
  const { userId } = await requireRole("patient");
  const parsed = validateReading({
    systolic: form.get("systolic"),
    diastolic: form.get("diastolic"),
    heartRate: form.get("heart_rate"),
    measuredAt: form.get("measured_at"),
    notes: form.get("notes"),
  });
  if (!parsed.ok) return { error: parsed.error };

  const hasRedFlags = form.get("has_red_flags") === "true";
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blood_pressure_readings")
    .insert({ ...parsed.value, user_id: userId })
    .select("id,systolic,diastolic,heart_rate,measured_at,notes")
    .single();

  if (error || !data) return { error: "Gagal menyimpan catatan. Pastikan koneksi dan coba lagi." };

  revalidatePath("/dashboard");
  revalidatePath("/tracker");

  return {
    result: {
      id: data.id,
      systolic: data.systolic,
      diastolic: data.diastolic,
      heart_rate: data.heart_rate,
      measured_at: data.measured_at,
      notes: data.notes,
      category: classifyBloodPressure(data.systolic, data.diastolic),
      guidance: getBloodPressureGuidance({ systolic: data.systolic, diastolic: data.diastolic, hasRedFlags }),
    },
  };
}
