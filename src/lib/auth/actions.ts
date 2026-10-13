"use server";

import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";
import { getCurrentRole } from "./roles";
import { registrationEnabled } from "./helpers.js";
import { validateRegistrationInput } from "./registration.js";

export type FormState = { error?: string; message?: string };
const email = (form: FormData) => String(form.get("email") ?? "").trim();
const password = (form: FormData) => String(form.get("password") ?? "");
const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;

export async function signIn(_previous: FormState, form: FormData): Promise<FormState> {
  const address = email(form);
  const secret = password(form);
  if (!validEmail(address) || !secret) return { error: "Isi email dan kata sandi yang valid." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: address, password: secret });
  if (error) return { error: "Email atau kata sandi tidak cocok." };
  const current = await getCurrentRole();
  if (!current) return { error: "Akun belum memiliki akses. Hubungi pengelola." };
  redirect(current.role === "admin" ? "/admin/dashboard" : "/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function registerPatient(_previous: FormState, form: FormData): Promise<FormState> {
  if (!registrationEnabled({ ENABLE_REGISTRATION: process.env.ENABLE_REGISTRATION })) return { error: "Pendaftaran belum tersedia." };
  const parsed = validateRegistrationInput(Object.fromEntries(form));
  if (!parsed.ok) return { error: parsed.error };
  const { display_name, email, phone_number, password } = parsed.value;
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name, phone_number },
      emailRedirectTo: `${process.env.APP_URL}/auth/callback?next=/dashboard`,
    },
  });
  if (error) return { error: "Pendaftaran gagal. Periksa kembali email atau coba lagi." };
  return { message: "Pendaftaran berhasil dikirim. Jika akun baru membutuhkan verifikasi, periksa email Anda." };
}

export async function requestPasswordReset(_previous: FormState, form: FormData): Promise<FormState> {
  const address = email(form);
  if (!validEmail(address)) return { error: "Masukkan alamat email yang valid." };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(address, {
    redirectTo: `${process.env.APP_URL}/auth/callback?next=/reset-password`,
  });
  return { message: "Jika akun terdaftar, tautan pemulihan telah dikirim ke email." };
}

export async function updatePassword(_previous: FormState, form: FormData): Promise<FormState> {
  const secret = password(form);
  if (secret.length < 12 || secret.length > 128) return { error: "Kata sandi harus 12–128 karakter." };
  const supabase = await createClient();
  // Callback exchanges only a recovery code before this page becomes available.
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Tautan pemulihan tidak valid atau kedaluwarsa." };
  const { error } = await supabase.auth.updateUser({ password: secret });
  if (error) return { error: "Gagal memperbarui kata sandi. Minta tautan baru." };
  return { message: "Kata sandi diperbarui. Anda dapat masuk kembali." };
}
