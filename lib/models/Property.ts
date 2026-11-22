import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProperty extends Document {
  _id: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  type: "Boys PG" | "Girls PG" | "Co-living" | "Luxury Studio" | "Apartment";
  verified: boolean;
  featured: boolean;
  city: string;
  locality: string;
  address: string;
  location?: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  distanceFromCollege: string;
  startingPrice: number;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  preferredFor: "Anyone" | "Male" | "Female";
  amenities: string[];
  foodProvided: boolean;
  foodType?: string;
  securityFeatures: string[];
  houseRules: string[];
  nearbyLandmarks: string[];
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "PUBLISHED" | "UNAVAILABLE";
  rejectionReason?: string;
  descriptionVector?: number[]; // Reserved for AI Vector Search
  aiSummary?: string;           // Reserved for AI Property Summarizer
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true },
    type: {
      type: String,
      enum: ["Boys PG", "Girls PG", "Co-living", "Luxury Studio", "Apartment"],
      required: true,
      index: true,
    },
    verified: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    city: { type: String, required: true, index: true },
    locality: { type: String, required: true, index: true },
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [77.5946, 12.9716] }, // default Bangalore coords [lng, lat]
    },
    distanceFromCollege: { type: String, default: "" },
    startingPrice: { type: Number, required: true, index: true },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    images: [{ type: String }],
    description: { type: String, default: "" },
    preferredFor: { type: String, enum: ["Anyone", "Male", "Female"], default: "Anyone", index: true },
    amenities: [{ type: String }],
    foodProvided: { type: Boolean, default: false },
    foodType: { type: String },
    securityFeatures: [{ type: String }],
    houseRules: [{ type: String }],
    nearbyLandmarks: [{ type: String }],
    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "PUBLISHED", "UNAVAILABLE"],
      default: "DRAFT",
      index: true,
    },
    rejectionReason: { type: String },
    descriptionVector: [{ type: Number }],
    aiSummary: { type: String },
  },
  { timestamps: true }
);

PropertySchema.index({ location: "2dsphere" });
PropertySchema.index({ title: "text", description: "text", locality: "text" });
PropertySchema.index({ status: 1, city: 1, type: 1 });

export const Property: Model<IProperty> =
  mongoose.models.Property || mongoose.model<IProperty>("Property", PropertySchema);
