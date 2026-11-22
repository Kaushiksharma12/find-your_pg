import { z } from "zod";

export const createEnquirySchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  roomId: z.string().optional(),
  message: z.string().min(5, "Message must be at least 5 characters long"),
  subject: z.string().optional(),
});

export const replyEnquirySchema = z.object({
  message: z.string().min(1, "Reply message cannot be empty"),
});

export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;
export type ReplyEnquiryInput = z.infer<typeof replyEnquirySchema>;
