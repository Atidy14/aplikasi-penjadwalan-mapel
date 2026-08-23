import { getAuditLogs } from "@/actions/handoverActions";
import Link from "next/link";

export default async function AuditHistoryPage() {
  const logs = await getAuditLogs();

  return (
    <div className="p-8 max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-end mb-8 border-b pb-4">
        <div>
          <Link href="/master/teachers" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            &larr; Kembali ke Daftar Guru
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Riwayat Perubahan (Audit Log)
          </h1>
          <p className="text-slate-500 mt-1">Memantau riwayat pergantian jadwal dan aktivitas krusial sistem.</p>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Belum ada catatan aktivitas.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {logs.map((log) => {
              // Parse JSON details
              let detailsStr = "";
              try {
                if (log.action === "TEACHER_HANDOVER") {
                  const d = log.details as any;
                  detailsStr = `Guru ${d.oldTeacher?.name} digantikan oleh ${d.newTeacher?.name}. Mempengaruhi ${d.affectedSchedulesCount} jadwal aktif. Berlaku mulai: ${new Date(d.effectiveDate).toLocaleDateString("id-ID")}.`;
                } else {
                  detailsStr = JSON.stringify(log.details);
                }
              } catch (e) {
                detailsStr = "Gagal memproses detail JSON.";
              }

              return (
                <li key={log.id} className="p-5 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                          {log.action.replace(/_/g, " ")}
                        </span>
                        <span className="text-sm font-medium text-slate-600">
                          dilakukan oleh {log.performedBy || "Sistem"}
                        </span>
                      </div>
                      <p className="text-slate-800 text-sm mt-2">{detailsStr}</p>
                    </div>
                    <div className="text-xs font-semibold text-slate-400 whitespace-nowrap bg-slate-100 px-3 py-1.5 rounded-full">
                      {new Date(log.timestamp).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
