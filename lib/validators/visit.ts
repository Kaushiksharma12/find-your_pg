import { z } from "zod";

export const createVisitSchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  scheduledDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  timeSlot: z.string().min(1, "Time slot is required"),
  visitType: z.enum(["PHYSICAL", "VIRTUAL"]).default("PHYSICAL"),
  note: z.string().optional(),
});

export const updateVisitStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "RESCHEDULED", "DECLINED", "COMPLETED", "CANCELLED"]),
  note: z.string().optional(),
});

export type CreateVisitInput = z.infer<typeof createVisitSchema>;
export type UpdateVisitStatusInput = z.infer<typeof updateVisitStatusSchema>;
