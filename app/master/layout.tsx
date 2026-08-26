import PersistentSidebar from "@/app/components/PersistentSidebar";
import { prisma } from "@/app/lib/prisma";

export default async function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const activeYear = await prisma.academicYear.findFirst({ where: { isActive: true } });

  return (
    <div className="min-h-screen bg-[#f7f6f4] text-[#201e1d] flex antialiased selection:bg-emerald-200">
      {/* ══ PERSISTENT SIDEBAR FRAME (KIRI) ══ */}
      <PersistentSidebar academicYearName={activeYear?.name || "2026/2027 Ganjil"} />

      {/* ══ AREA KONTEN UTAMA (KANAN) ══ */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-[#f7f6f4]">
        {children}
      </main>
    </div>
  );
}
