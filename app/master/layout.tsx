import Link from "next/link";

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="bg-emerald-600 group-hover:bg-emerald-500 text-white font-bold p-1.5 rounded-lg text-sm transition">📅 SIP</span>
            <span className="font-bold text-lg tracking-tight text-white group-hover:text-emerald-300 transition">SIP-MAPEL</span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Beranda
            </Link>
            <Link
              href="/master/teachers"
              className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Guru
            </Link>
            <Link
              href="/master/subjects"
              className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Mata Pelajaran
            </Link>
            <Link
              href="/master/classes"
              className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Kelas
            </Link>
            <Link
              href="/master/teaching-load"
              className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Kertas Kerja
            </Link>
            <Link
              href="/master/auto-generate"
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm"
            >
              ⚡ Auto-Generate
            </Link>
            <Link
              href="/master/audit"
              className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
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
