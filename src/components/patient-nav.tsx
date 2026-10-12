"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Home, Menu, Puzzle } from "lucide-react";
import { patientNavItems } from "@/lib/navigation.js";

const icons = { home: Home, activity: Activity, puzzle: Puzzle, menu: Menu };

export function PatientNav() {
  const pathname = usePathname();
  return <nav aria-label="Navigasi utama" className="patient-nav">
    {patientNavItems.map((item) => {
      const Icon = icons[item.icon as keyof typeof icons];
      const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
      return <Link key={item.href} href={item.href} prefetch={true} aria-current={active ? "page" : undefined} className={`patient-nav-item ${active ? "active" : ""}`}>
        <span className="icon-wrap"><Icon aria-hidden="true" size={22} /></span>
        <span className="label-wrap">{item.labelId}</span>
        {active && <span className="active-pill" aria-hidden="true" />}
      </Link>;
    })}
  </nav>;
}
