import { z } from "zod";

export const parseQueryRequestSchema = z.object({
  query: z.string().min(1, "Search query text is required"),
  sessionId: z.string().optional(),
});

export const searchIntentSchema = z.object({
  queryText: z.string(),
  city: z.string().nullable().optional(),
  locality: z.string().nullable().optional(),
  landmarkOrCollege: z.string().nullable().optional(),
  minPrice: z.number().positive().nullable().optional(),
  maxPrice: z.number().positive().nullable().optional(),
  propertyType: z
    .enum(["Boys PG", "Girls PG", "Co-living", "Luxury Studio", "Apartment", "PG"])
    .nullable()
    .optional(),
  preferredFor: z.enum(["Male", "Female", "Anyone"]).nullable().optional(),
  roomOccupancy: z
    .enum(["Single", "2 Sharing", "3 Sharing", "4 Sharing"])
    .nullable()
    .optional(),
  amenities: z.array(z.string()).default([]),
  mealsRequired: z.boolean().nullable().optional(),
  foodType: z.string().nullable().optional(),
  furnished: z.boolean().nullable().optional(),
});

export type ParseQueryRequest = z.infer<typeof parseQueryRequestSchema>;
export type SearchIntent = z.infer<typeof searchIntentSchema>;
