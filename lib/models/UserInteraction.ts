import mongoose, { Schema, Document, Model } from "mongoose";

export type EventType =
  | "SEARCH_PERFORMED"
  | "PROPERTY_VIEWED"
  | "PROPERTY_SAVED"
  | "PROPERTY_UNSAVED"
  | "PROPERTY_COMPARED"
  | "ENQUIRY_SENT"
  | "SITE_VISIT_REQUESTED"
  | "BOOKING_REQUESTED"
  | "BOOKING_CONFIRMED";

export interface IUserInteraction extends Document {
  _id: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  sessionId?: string;
  searchId?: string;
  eventType: EventType;
  property?: mongoose.Types.ObjectId;
  room?: mongoose.Types.ObjectId;
  searchCriteria?: {
    queryText?: string;
    city?: string;
    locality?: string;
    landmarkOrCollege?: string;
    priceMin?: number;
    priceMax?: number;
    propertyType?: string;
    preferredFor?: string;
    roomOccupancy?: string;
    amenities?: string[];
    mealsRequired?: boolean;
    foodType?: string;
    furnished?: boolean;
  };
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

const UserInteractionSchema = new Schema<IUserInteraction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    sessionId: { type: String, index: true },
    searchId: { type: String, index: true },
    eventType: {
      type: String,
      enum: [
        "SEARCH_PERFORMED",
        "PROPERTY_VIEWED",
        "PROPERTY_SAVED",
        "PROPERTY_UNSAVED",
        "PROPERTY_COMPARED",
        "ENQUIRY_SENT",
        "SITE_VISIT_REQUESTED",
        "BOOKING_REQUESTED",
        "BOOKING_CONFIRMED",
      ],
      required: true,
      index: true,
    },
    property: { type: Schema.Types.ObjectId, ref: "Property", index: true },
    room: { type: Schema.Types.ObjectId, ref: "Room" },
    searchCriteria: {
      queryText: { type: String },
      city: { type: String },
      locality: { type: String },
      landmarkOrCollege: { type: String },
      priceMin: { type: Number },
      priceMax: { type: Number },
      propertyType: { type: String },
      preferredFor: { type: String },
      roomOccupancy: { type: String },
      amenities: [{ type: String }],
      mealsRequired: { type: Boolean },
      foodType: { type: String },
      furnished: { type: Boolean },
    },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const UserInteraction: Model<IUserInteraction> =
  mongoose.models.UserInteraction ||
  mongoose.model<IUserInteraction>("UserInteraction", UserInteractionSchema);
