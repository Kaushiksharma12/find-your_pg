import { z } from "zod";

export const createPropertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  type: z.enum(["Boys PG", "Girls PG", "Co-living", "Luxury Studio", "Apartment"]),
  city: z.string().min(2, "City is required"),
  locality: z.string().min(2, "Locality is required"),
  address: z.string().min(5, "Address is required"),
  startingPrice: z.number().positive("Starting price must be positive"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  preferredFor: z.enum(["Anyone", "Male", "Female"]).default("Anyone"),
  amenities: z.array(z.string()).default([]),
  foodProvided: z.boolean().default(false),
  foodType: z.string().optional(),
  securityFeatures: z.array(z.string()).default([]),
  houseRules: z.array(z.string()).default([]),
  nearbyLandmarks: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
});

export const createRoomSchema = z.object({
  name: z.string().min(2, "Room name is required"),
  price: z.number().positive("Price must be positive"),
  deposit: z.number().nonnegative("Deposit must be non-negative"),
  occupancy: z.enum(["Single", "2 Sharing", "3 Sharing", "4 Sharing"]),
  totalInventory: z.number().int().min(1, "Total inventory must be at least 1").default(5),
  amenities: z.array(z.string()).default([]),
  image: z.string().optional(),
});

export const updatePropertySchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").optional(),
    type: z.enum(["Boys PG", "Girls PG", "Co-living", "Luxury Studio", "Apartment"]).optional(),
    city: z.string().min(2, "City is required").optional(),
    locality: z.string().min(2, "Locality is required").optional(),
    address: z.string().min(5, "Address is required").optional(),
    distanceFromCollege: z.string().optional(),
    startingPrice: z.number().positive("Starting price must be positive").optional(),
    description: z.string().min(10, "Description must be at least 10 characters").optional(),
    preferredFor: z.enum(["Anyone", "Male", "Female"]).optional(),
    amenities: z.array(z.string()).optional(),
    foodProvided: z.boolean().optional(),
    foodType: z.string().optional(),
    securityFeatures: z.array(z.string()).optional(),
    houseRules: z.array(z.string()).optional(),
    nearbyLandmarks: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
  })
  .strict();

export const updateRoomSchema = z
  .object({
    name: z.string().min(2, "Room name is required").optional(),
    price: z.number().positive("Price must be positive").optional(),
    deposit: z.number().nonnegative("Deposit must be non-negative").optional(),
    occupancy: z.enum(["Single", "2 Sharing", "3 Sharing", "4 Sharing"]).optional(),
    totalInventory: z.number().int().min(1, "Total inventory must be at least 1").optional(),
    amenities: z.array(z.string()).optional(),
    image: z.string().optional(),
    isAvailable: z.boolean().optional(),
  })
  .strict();

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
