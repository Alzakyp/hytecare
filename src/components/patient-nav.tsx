"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BookOpen, Home, Menu, Puzzle } from "lucide-react";
import { patientNavItems } from "@/lib/navigation.js";
import { useLocale } from "./locale-provider";

const icons = { home: Home, activity: Activity, book: BookOpen, puzzle: Puzzle, menu: Menu };

export function PatientNav() {
  const pathname = usePathname();
  const { locale } = useLocale();
  return <nav aria-label={locale === "id" ? "Navigasi utama" : "Main navigation"} className="patient-nav">
    {patientNavItems.map((item) => {
      const Icon = icons[item.icon as keyof typeof icons];
      const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
      return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={active ? "active" : ""}>
        <Icon aria-hidden="true" size={21} /><span>{locale === "id" ? item.labelId : item.labelEn}</span>
      </Link>;
    })}
  </nav>;
}
