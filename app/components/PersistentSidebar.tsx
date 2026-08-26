"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Zap,
  BookOpen,
  Users,
  GraduationCap,
  School,
  ShieldCheck,
  FileText,
  History,
} from "lucide-react";

interface SidebarProps {
  academicYearName?: string;
}

export default function PersistentSidebar({
  academicYearName = "2026/2027 Ganjil",
}: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { label: "Beranda", href: "/", icon: LayoutDashboard },
    { label: "Papan Jadwal", href: "/master/classes", icon: Calendar },
    { label: "Auto-Generate", href: "/master/auto-generate", icon: Zap },
    { label: "Kertas Kerja", href: "/master/teaching-load", icon: BookOpen },
    { label: "Guru & Izin", href: "/master/teachers", icon: Users },
    { label: "Mata Pelajaran", href: "/master/subjects", icon: GraduationCap },
    { label: "Kelas & Ruangan", href: "/master/classes", icon: School },
    { label: "Pusat Bentrok", href: "/master/conflicts", icon: ShieldCheck },
    { label: "Laporan & Cetak", href: "/master/print", icon: FileText },
    { label: "Audit Log", href: "/master/audit", icon: History },
  ];

  return (
    <aside className="w-64 min-w-[250px] bg-[#f7f6f4] border-r border-slate-300 min-h-screen flex flex-col justify-between py-6 px-4 shrink-0 select-none">
      
      {/* ══ 1. HEADER LOGO & IDENTITAS ══ */}
      <div className="space-y-4">
        <Link href="/" className="flex items-center gap-3 px-2 group">
          <img
            src="/annida-logo.jpg"
            alt="Logo Annida"
            className="w-10 h-12 object-contain rounded border border-slate-300 bg-white p-0.5 shadow-2xs group-hover:scale-105 transition shrink-0"
          />
          <div>
            <div className="font-serif font-bold text-base text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>SIP</span>
              <span className="text-emerald-700 font-black">·</span>
              <span>MAPEL</span>
            </div>
            <div className="text-[10px] font-bold text-emerald-900 leading-tight">
              Ponpes Annida Al Islamy 2
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              T.A. {academicYearName}
            </div>
          </div>
        </Link>

        {/* Garis Pembatas Tipis */}
        <div className="h-px bg-slate-300 mx-2"></div>

        {/* ══ 2. MENU NAVIGASI PERSISTEN ══ */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Deteksi rute aktif
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition ${
                  isActive
                    ? "bg-emerald-50 text-emerald-900 font-bold border-l-3 border-emerald-700 shadow-2xs"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 font-medium"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-emerald-700" : "text-slate-500"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ══ 3. FOOTER PROFIL PENGGUNA & KALIGRAFI ══ */}
      <div className="pt-4 border-t border-slate-300 px-2 space-y-2">
        <div dir="rtl" className="font-serif text-sm font-bold text-emerald-900 leading-none">
          معهد النداء الإسلامي ٢
        </div>
        <div className="text-[11px] text-slate-500 leading-tight">
          <div className="font-bold text-slate-800">Admin Kurikulum</div>
          <div>Yayasan Annida Al Islamy Setu Bekasi</div>
        </div>
      </div>

    </aside>
  );
}
