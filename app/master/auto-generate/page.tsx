import GeneratorButton from "@/app/components/GeneratorButton";
import Link from "next/link";

export default function AutoGeneratePage() {
  return (
    <div className="p-8 max-w-4xl mx-auto pb-32">
      <div className="flex justify-between items-end mb-8 border-b pb-4">
        <div>
          <Link href="/master/teaching-load" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            &larr; Kembali ke Kertas Kerja
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Auto-Generator Jadwal
          </h1>
          <p className="text-slate-500 mt-1">Sistem pencarian slot otomatis (Algoritma Greedy Heuristic) bebas bentrok.</p>
        </div>
      </div>

      <GeneratorButton />
      
    </div>
  );
}
