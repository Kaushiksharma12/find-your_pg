import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRoom extends Document {
  _id: mongoose.Types.ObjectId;
  property: mongoose.Types.ObjectId;
  name: string;
  price: number;
  deposit: number;
  occupancy: "Single" | "2 Sharing" | "3 Sharing" | "4 Sharing";
  totalInventory: number; // Total physical units/beds available for this room type
  amenities: string[];
  image?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    property: { type: Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, index: true },
    deposit: { type: Number, required: true },
    occupancy: {
      type: String,
      enum: ["Single", "2 Sharing", "3 Sharing", "4 Sharing"],
      required: true,
    },
    totalInventory: { type: Number, required: true, min: 1, default: 5 },
    amenities: [{ type: String }],
    image: { type: String },
    isAvailable: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

RoomSchema.index({ property: 1, isAvailable: 1, price: 1 });

export const Room: Model<IRoom> = mongoose.models.Room || mongoose.model<IRoom>("Room", RoomSchema);
