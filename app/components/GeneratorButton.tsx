"use client";

import { useState, useTransition } from "react";
import { runAutoGenerator } from "@/app/actions/autoGenerateActions";

export default function GeneratorButton() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleGenerate = () => {
    setError("");
    setResult(null);
    startTransition(async () => {
      try {
        const res = await runAutoGenerator();
        setResult(res);
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white border rounded-xl shadow-sm">
        <h2 className="text-xl font-bold mb-2">Jalankan Auto-Generator</h2>
        <p className="text-slate-500 text-sm mb-6">
          Peringatan: Menjalankan fitur ini akan menghapus semua jadwal yang sedang berjalan pada tahun ajaran aktif, dan menyusunnya ulang dari awal secara otomatis.
        </p>
        
        <button 
          onClick={handleGenerate}
          disabled={isPending}
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
        >
          {isPending ? "Sedang Menyusun Jadwal..." : "Mulai Auto-Generate"}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <strong>Gagal:</strong> {error}
        </div>
      )}

      {result && (
        <div className="p-6 bg-white border border-green-200 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-green-700 mb-2">Penjadwalan Selesai!</h3>
          <p className="text-sm text-slate-700 mb-4">Berhasil menyusun <strong>{result.generatedCount}</strong> blok jadwal.</p>
          
          {result.unassigned.length > 0 ? (
            <div className="mt-4 border-t pt-4">
              <h4 className="font-semibold text-amber-600 mb-2">Peringatan: Beberapa jadwal gagal ditempatkan karena bentrok total / slot penuh.</h4>
              <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                {result.unassigned.map((u: any, i: number) => (
                  <li key={i}>
                    {u.class} - {u.subject} ({u.teacher}): Gagal menempatkan {u.unassignedPeriods} jam.
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-500 mt-3">Silakan masuk ke "Papan Penjadwalan" kelas terkait untuk menempatkannya secara manual.</p>
            </div>
          ) : (
            <div className="mt-4 border-t pt-4 text-sm text-emerald-600 font-medium">
              Luar biasa! 100% Kertas Kerja berhasil dijadwalkan tanpa ada slot yang tertinggal atau bentrok.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
