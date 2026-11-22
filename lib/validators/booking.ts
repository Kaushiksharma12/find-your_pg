import { z } from "zod";

export const createBookingSchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  roomId: z.string().min(1, "Room ID is required"),
  checkInDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid check-in date"),
  checkOutDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid check-out date"),
  guestCount: z.number().int().positive().default(1),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"]),
  declineReason: z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
