import { RoomInventory } from "@/lib/models/RoomInventory";

/**
 * Returns array of "YYYY-MM-DD" date strings for each night between checkIn and checkOut.
 */
export function getDatesInRange(checkInDate: Date, checkOutDate: Date): string[] {
  const dates: string[] = [];
  const curr = new Date(checkInDate);
  curr.setHours(0, 0, 0, 0);

  const end = new Date(checkOutDate);
  end.setHours(0, 0, 0, 0);

  // Each night before checkOut
  while (curr < end) {
    const yyyy = curr.getFullYear();
    const mm = String(curr.getMonth() + 1).padStart(2, "0");
    const dd = String(curr.getDate()).padStart(2, "0");
    dates.push(`${yyyy}-${mm}-${dd}`);
    curr.setDate(curr.getDate() + 1);
  }

  return dates;
}

/**
 * Concurrency-safe reservation of date inventory.
 * Atomically increments bookedCount for each date IF bookedCount < totalInventory.
 * If any date fails, rolls back previously reserved dates.
 */
export async function reserveDateInventory(
  roomId: string,
  checkInDate: Date,
  checkOutDate: Date,
  totalInventory: number
): Promise<{ success: boolean; dateFailed?: string }> {
  const dates = getDatesInRange(checkInDate, checkOutDate);
  const reservedDates: string[] = [];

  for (const dateStr of dates) {
    // 1. Ensure inventory record exists for (room, dateStr)
    await RoomInventory.updateOne(
      { room: roomId, date: dateStr },
      { $setOnInsert: { bookedCount: 0 } },
      { upsert: true }
    );

    // 2. Atomic conditional update: Increment ONLY IF bookedCount < totalInventory
    const updated = await RoomInventory.findOneAndUpdate(
      {
        room: roomId,
        date: dateStr,
        bookedCount: { $lt: totalInventory },
      },
      { $inc: { bookedCount: 1 } },
      { returnDocument: "after" }
    );

    if (!updated) {
      // Rollback already reserved dates for this attempt
      for (const rollbackDate of reservedDates) {
        await RoomInventory.findOneAndUpdate(
          { room: roomId, date: rollbackDate, bookedCount: { $gt: 0 } },
          { $inc: { bookedCount: -1 } }
        );
      }
      return { success: false, dateFailed: dateStr };
    }

    reservedDates.push(dateStr);
  }

  return { success: true };
}

/**
 * Releases reserved inventory for a date range when booking is cancelled, rejected, or completed.
 */
export async function releaseDateInventory(
  roomId: string,
  checkInDate: Date,
  checkOutDate: Date
): Promise<void> {
  const dates = getDatesInRange(checkInDate, checkOutDate);

  for (const dateStr of dates) {
    await RoomInventory.findOneAndUpdate(
      { room: roomId, date: dateStr, bookedCount: { $gt: 0 } },
      { $inc: { bookedCount: -1 } }
    );
  }
}
