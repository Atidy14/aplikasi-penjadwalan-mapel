import Link from "next/link";

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-950 text-white shadow-md sticky top-0 z-40 border-b border-emerald-900/40">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/annida-logo.jpg"
              alt="Logo"
              className="w-8 h-10 object-contain rounded bg-white p-0.5 shadow-xs shrink-0"
            />
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-tight leading-none">
                Ponpes Annida Al Islamy 2 • SMP Annida
              </span>
              <span className="text-xs font-black tracking-tight text-white group-hover:text-emerald-300 transition">
                SIP-MAPEL v2.0 Pro
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Beranda
            </Link>
            <Link
              href="/master/teachers"
              className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Guru
            </Link>
            <Link
              href="/master/subjects"
              className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Mata Pelajaran
            </Link>
            <Link
              href="/master/classes"
              className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Kelas
            </Link>
            <Link
              href="/master/teaching-load"
              className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Kertas Kerja
            </Link>
            <Link
              href="/master/auto-generate"
              className="px-3 py-1.5 rounded-md text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-xs"
            >
              ⚡ Auto-Generate
            </Link>
            <Link
              href="/master/print"
              className="px-3 py-1.5 rounded-md text-xs font-medium text-emerald-300 hover:text-white hover:bg-slate-800 transition"
            >
              🖨️ Cetak PDF
            </Link>
            <Link
              href="/master/audit"
              className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Audit
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
