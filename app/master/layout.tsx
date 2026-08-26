import Link from "next/link";

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f7f6f4] text-[#201e1d] font-sans antialiased selection:bg-emerald-200">
      {/* Top Navbar Broadsheet */}
      <header className="bg-[#f7f6f4] sticky top-0 z-40">
        <div className="max-w-[1340px] mx-auto px-6 sm:px-10 py-3 flex items-center justify-between gap-4 flex-wrap">
          
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/annida-logo.jpg"
              alt="Logo"
              className="w-8 h-10 object-contain rounded border border-slate-300 bg-white p-0.5 shadow-2xs shrink-0"
            />
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-bold text-emerald-900 uppercase tracking-tight leading-none">
                Ponpes Annida Al Islamy 2 • SMP Annida
              </span>
              <span className="text-xs font-black tracking-tight text-slate-900 group-hover:text-emerald-800 transition">
                SIP<span className="text-emerald-700">·</span>MAPEL v2.0
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2 text-xs font-medium">
            <Link
              href="/"
              className="px-2.5 py-1.5 rounded text-slate-700 hover:text-emerald-800 hover:bg-slate-200/60 transition"
            >
              Beranda
            </Link>
            <Link
              href="/master/teachers"
              className="px-2.5 py-1.5 rounded text-slate-700 hover:text-emerald-800 hover:bg-slate-200/60 transition"
            >
              Guru & Izin
            </Link>
            <Link
              href="/master/subjects"
              className="px-2.5 py-1.5 rounded text-slate-700 hover:text-emerald-800 hover:bg-slate-200/60 transition"
            >
              Mapel
            </Link>
            <Link
              href="/master/classes"
              className="px-2.5 py-1.5 rounded text-slate-700 hover:text-emerald-800 hover:bg-slate-200/60 transition"
            >
              Kelas
            </Link>
            <Link
              href="/master/teaching-load"
              className="px-2.5 py-1.5 rounded text-slate-700 hover:text-emerald-800 hover:bg-slate-200/60 transition"
            >
              Kertas Kerja
            </Link>
            <Link
              href="/master/auto-generate"
              className="px-3 py-1.5 rounded bg-emerald-800 hover:bg-emerald-900 text-white font-bold transition shadow-2xs"
            >
              ⚡ Auto-Generate
            </Link>
            <Link
              href="/master/conflicts"
              className="px-2.5 py-1.5 rounded text-emerald-900 font-bold hover:bg-emerald-100 transition"
            >
              🛡️ Pusat Bentrok
            </Link>
            <Link
              href="/master/print"
              className="px-2.5 py-1.5 rounded text-slate-700 hover:text-emerald-800 hover:bg-slate-200/60 transition"
            >
              🖨️ Cetak PDF
            </Link>
            <Link
              href="/master/audit"
              className="px-2.5 py-1.5 rounded text-slate-700 hover:text-emerald-800 hover:bg-slate-200/60 transition"
            >
              Audit
            </Link>
          </nav>
        </div>

        {/* Double Rule Editorial */}
        <div className="max-w-[1340px] mx-auto px-6 sm:px-10">
          <div className="h-[2.5px] bg-[#201e1d]"></div>
          <div className="h-[1px] bg-[#201e1d] mt-[2px]"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1340px] mx-auto px-6 sm:px-10 py-6">{children}</main>
    </div>
  );
}
