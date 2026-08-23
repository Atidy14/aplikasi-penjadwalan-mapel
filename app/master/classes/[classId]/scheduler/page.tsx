import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { 
  getSchedulesByClass, 
  getAllTimeSettings, 
  getSchedulerDropdownData,
  getClassSubjectValidations
} from "@/app/actions/schedulerActions";
import SchedulerGrid from "@/app/components/SchedulerGrid";
import Link from "next/link";

type Props = {
  params: Promise<{
    classId: string;
  }>;
};

export default async function SchedulerPage({ params }: Props) {
  const { classId } = await params;
  
  // Ambil data Kelas
  const classGroup = await prisma.classGroup.findUnique({
    where: { id: classId },
  });

  if (!classGroup) {
    return notFound();
  }

  // Fetch semua data yang dibutuhkan secara paralel
  const [schedules, timeSettings, dropdownData, validations] = await Promise.all([
    getSchedulesByClass(classId),
    getAllTimeSettings(),
    getSchedulerDropdownData(),
    getClassSubjectValidations(classId),
  ]);

  return (
    <div className="p-8 max-w-[1400px] mx-auto pb-32">
      {/* Header */}
      <div className="flex justify-between items-end mb-8 border-b pb-4">
        <div>
          <Link href="/master/classes" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            &larr; Kembali ke Daftar Kelas
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Papan Penjadwalan
          </h1>
          <p className="text-slate-500 mt-1">Mengelola jadwal untuk kelas <strong className="text-slate-700">{classGroup.name}</strong></p>
        </div>
      </div>

      {/* Jika belum ada time settings, peringatkan */}
      {timeSettings.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md">
          Belum ada pengaturan waktu (Time Settings). Harap jalankan layanan TimeBlockGenerator terlebih dahulu.
        </div>
      ) : (
        <SchedulerGrid 
          classGroupId={classGroup.id}
          classGroupName={classGroup.name}
          schedules={schedules}
          timeSettings={timeSettings}
          dropdownData={dropdownData}
          validations={validations}
        />
      )}
    </div>
  );
}
