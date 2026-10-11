import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HyteCare",
  description: "Pencatatan dan edukasi hipertensi.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
