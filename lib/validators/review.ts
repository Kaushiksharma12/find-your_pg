import { z } from "zod";

export const createReviewSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  propertyId: z.string().min(1, "Property ID is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, "Review comment must be at least 10 characters long"),
});

export const respondReviewSchema = z.object({
  comment: z.string().min(2, "Owner response cannot be empty"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type RespondReviewInput = z.infer<typeof respondReviewSchema>;
