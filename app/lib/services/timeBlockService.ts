import { prisma } from "../prisma";

/**
 * Fungsi untuk mem-parsing string waktu HH:mm menjadi objek Date
 * (hanya untuk memudahkan perhitungan durasi)
 */
function parseTime(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Fungsi untuk memformat objek Date menjadi string waktu HH:mm
 */
function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Fungsi TimeBlockGenerator
 * Mengambil waktu mulai sekolah dan membuat 8 periode pelajaran 
 * masing-masing dengan durasi 40 menit, lalu menyimpannya ke database.
 * 
 * @param schoolStartTime Waktu mulai sekolah dalam format "HH:mm" (contoh: "07:00")
 * @returns Array dari TimeSetting yang berhasil disimpan
 */
export async function generateTimeBlocks(schoolStartTime: string) {
  const TOTAL_PERIODS = 8;
  const PERIOD_DURATION_MINUTES = 40;

  let currentTime = parseTime(schoolStartTime);
  
  // Menggunakan transaksi agar perubahan database bersifat atomik 
  // (jika gagal satu, gagal semua)
  return await prisma.$transaction(async (tx) => {
    const blocks = [];

    for (let i = 1; i <= TOTAL_PERIODS; i++) {
      const startTimeStr = formatTime(currentTime);
      
      // Tambahkan 40 menit untuk waktu selesai
      currentTime.setMinutes(currentTime.getMinutes() + PERIOD_DURATION_MINUTES);
      const endTimeStr = formatTime(currentTime);

      // Gunakan upsert agar bisa di-run berulang kali dengan aman.
      // Jika periodNumber sudah ada, update waktunya. Jika belum, buat baru.
      const timeSetting = await tx.timeSetting.upsert({
        where: { periodNumber: i },
        update: {
          startTime: startTimeStr,
          endTime: endTimeStr,
        },
        create: {
          periodNumber: i,
          startTime: startTimeStr,
          endTime: endTimeStr,
        },
      });

      blocks.push(timeSetting);
    }

    return blocks;
  });
}

