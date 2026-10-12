"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListChecks, Puzzle, UserRound, Users } from "lucide-react";
import { adminNavItems } from "@/lib/navigation.js";

const icons = { layout: LayoutDashboard, users: Users, puzzle: Puzzle, list: ListChecks, user: UserRound };

export function AdminNav() {
  const path = usePathname();
  return <nav aria-label="Navigasi admin" className="admin-nav">
    {adminNavItems.map((item) => { const Icon = icons[item.icon as keyof typeof icons]; const active=path===item.href;
      return <Link key={item.href} href={item.href} prefetch={true} aria-current={active?"page":undefined} className={active?"active":""}>
        <Icon aria-hidden="true" size={20}/><span>{item.labelId}</span>
      </Link>; })}
  </nav>;
}
