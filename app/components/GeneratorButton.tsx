"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import {
  runAutoGenerator,
  runUndoGenerator,
  getCanUndoStatus,
} from "@/app/actions/autoGenerateActions";
import {
  Zap,
  RotateCcw,
  Printer,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info,
} from "lucide-react";

export default function GeneratorButton() {
  const [isPending, startTransition] = useTransition();
  const [isUndoPending, startUndoTransition] = useTransition();
  const [result, setResult] = useState<any>(null);
  const [undoMessage, setUndoMessage] = useState<string>("");
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [canUndo, setCanUndo] = useState(false);

  // Periksa apakah ada snapshot backup yang bisa di-undo saat halaman dimuat
  useEffect(() => {
    getCanUndoStatus().then((status) => setCanUndo(status));
  }, [result]);

  const executeGenerate = () => {
    setShowConfirmModal(false);
    setError("");
    setUndoMessage("");
    setResult(null);

    startTransition(async () => {
      try {
        const res: any = await runAutoGenerator();
        if (res && res.error) {
          setError(res.error);
        } else {
          setResult(res);
          setCanUndo(true);
        }
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan saat menyusun jadwal.");
      }
    });
  };

  const handleUndo = () => {
    if (!confirm("Apakah Anda yakin ingin membatalkan (Undo) dan memulihkan seluruh jadwal ke kondisi sebelum Auto-Generator dijalankan?")) {
      return;
    }

    setError("");
    setResult(null);

    startUndoTransition(async () => {
      try {
        const res: any = await runUndoGenerator();
        if (res && res.error) {
          setError(res.error);
        } else {
          setUndoMessage(`Berhasil memulihkan ${res.restoredCount} blok jadwal dari backup sebelumnya.`);
          setCanUndo(false);
        }
      } catch (err: any) {
        setError(err.message || "Gagal melakukan Undo.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Card Utama Auto Generator */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Jalankan Auto-Generator Cerdas</h2>
            <p className="text-xs text-slate-500">Penyusunan jadwal otomatis berbasis algoritma Greedy Heuristic anti-bentrok.</p>
          </div>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 my-5 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Perlindungan Data Otomatis:</strong>
            <p className="mt-0.5 leading-relaxed">
              Sebelum menyusun jadwal baru, sistem akan <strong>otomatis menyimpan snapshot backup</strong> dari jadwal lama Anda. Jika tidak sengaja tertekan atau hasil kurang memuaskan, Anda dapat menekan tombol <strong>Undo</strong> untuk memulihkannya seketika!
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Tombol 1: Mulai Auto-Generate (dengan Hanging Tooltip) */}
          <div className="relative group">
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isPending || isUndoPending}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-indigo-500/25 transition disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-current" />
              {isPending ? "Sedang Menyusun Jadwal Otomatis..." : "Mulai Auto-Generate"}
            </button>

            {/* Hanging Comment Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-40 pointer-events-none w-64 animate-in fade-in zoom-in-95">
              <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-3 rounded-lg shadow-xl text-center leading-snug border border-slate-700">
                ⚡ <strong>Mulai Eksekusi:</strong> Menyusun ulang jadwal seluruh kelas otomatis berdasarkan data Kertas Kerja.
              </div>
              <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
            </div>
          </div>

          {/* Tombol 2: UNDO (dengan Hanging Tooltip) */}
          {canUndo && (
            <div className="relative group">
              <button
                onClick={handleUndo}
                disabled={isPending || isUndoPending}
                className="inline-flex items-center gap-2 px-5 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-sm rounded-xl transition shadow-xs disabled:opacity-50"
              >
                <RotateCcw className={`w-4 h-4 ${isUndoPending ? "animate-spin" : ""}`} />
                {isUndoPending ? "Sedang Memulihkan..." : "Undo / Pulihkan Jadwal Sebelumnya"}
              </button>

              {/* Hanging Comment Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-40 pointer-events-none w-64 animate-in fade-in zoom-in-95">
                <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-3 rounded-lg shadow-xl text-center leading-snug border border-slate-700">
                  ⏪ <strong>Tombol Undo:</strong> Membatalkan generate dan mengembalikan seluruh jadwal ke kondisi sebelum tombol ditekan.
                </div>
                <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
              </div>
            </div>
          )}

          {/* Tombol 3: Cetak PDF Frame Atas (dengan Hanging Tooltip) */}
          <div className="relative group">
            <Link
              href="/master/print"
              className="inline-flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm rounded-xl transition"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              Cetak / Export PDF
            </Link>

            {/* Hanging Comment Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-40 pointer-events-none w-64 animate-in fade-in zoom-in-95">
              <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-3 rounded-lg shadow-xl text-center leading-snug border border-slate-700">
                🖨️ <strong>Cetak Jadwal Aktif:</strong> Buka lembar rekapitulasi untuk mencetak jadwal yang saat ini sudah tersimpan di database.
              </div>
              <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL KONFIRMASI (Mencegah Klik Tidak Sengaja) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <h3 className="text-lg font-black text-slate-900 mb-2">
              Konfirmasi Eksekusi Penjadwalan
            </h3>
            
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Apakah Anda yakin ingin menjalankan <strong>Auto-Generator</strong> sekarang? Jadwal aktif saat ini akan digantikan oleh distribusi baru yang disusun oleh algoritma.
              <br /><br />
              <span className="text-emerald-700 font-semibold">
                ✓ Backup otomatis akan disimpan sehingga Anda tetap bisa melakukan Undo setelahnya.
              </span>
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
              >
                Batal
              </button>
              <button
                onClick={executeGenerate}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition"
              >
                Ya, Jalankan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFIKASI UNDO BERHASIL */}
      {undoMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 text-sm animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <strong className="font-bold">Undo Berhasil:</strong> {undoMessage}
          </div>
        </div>
      )}

      {/* NOTIFIKASI ERROR */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3 text-sm animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <strong className="font-bold">Terjadi Kesalahan:</strong> {error}
          </div>
        </div>
      )}

      {/* HASIL SUKSES GENERATE & SHORTCUT LENGKAP */}
      {result && (
        <div className="p-6 bg-white border-2 border-emerald-300 rounded-2xl shadow-md space-y-6 animate-in zoom-in-95">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Penjadwalan Berhasil Disusun!</h3>
                <p className="text-xs text-slate-500">
                  Total <strong className="text-emerald-700 font-bold">{result.generatedCount} blok jam pelajaran</strong> berhasil dipetakan ke seluruh kelas.
                </p>
              </div>
            </div>

            {/* SHORTCUT AKSI CEPAT DENGAN HANGING TOOLTIP */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              
              {/* Tombol Cetak Hasil Baru (Hijau) */}
              <div className="relative group">
                <Link
                  href="/master/print"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  <Printer className="w-4 h-4" />
                  Cetak / Simpan PDF
                </Link>

                {/* Hanging Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-40 pointer-events-none w-56 animate-in fade-in zoom-in-95">
                  <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-3 rounded-lg shadow-xl text-center leading-snug border border-slate-700">
                    📄 <strong>Cetak Hasil Baru:</strong> Langsung cetak / simpan dokumen PDF dari jadwal yang baru saja berhasil disusun.
                  </div>
                  <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
                </div>
              </div>

              {/* Tombol Lihat Papan Jadwal (Hitam) */}
              <div className="relative group">
                <Link
                  href="/master/classes"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  <Calendar className="w-4 h-4" />
                  Lihat Papan Jadwal
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {/* Hanging Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-40 pointer-events-none w-56 animate-in fade-in zoom-in-95">
                  <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-3 rounded-lg shadow-xl text-center leading-snug border border-slate-700">
                    📅 <strong>Buka Papan Kelas:</strong> Periksa grid jadwal per rombel kelas dan progress pemenuhan target jam.
                  </div>
                  <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
                </div>
              </div>

            </div>
          </div>

          {/* Rincian Status Unassigned (Jika Ada) */}
          {result.unassigned && result.unassigned.length > 0 ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Perhatian: Beberapa penugasan memerlukan penyesuaian manual
              </div>
              <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1">
                {result.unassigned.map((u: any, i: number) => (
                  <li key={i}>
                    <strong>{u.class}</strong> - {u.subject} ({u.teacher}): Tersisa <strong>{u.unassignedPeriods} jam</strong> yang belum dapat slot kosong.
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-slate-500 mt-3">
                Tip: Anda dapat membuka Papan Penjadwalan kelas terkait dan memilih slot kosong yang tersedia secara manual.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Sempurna!</strong> Seluruh 100% beban mengajar dari Kertas Kerja telah terdistribusi merata tanpa ada slot yang tertinggal atau bentrok guru.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
