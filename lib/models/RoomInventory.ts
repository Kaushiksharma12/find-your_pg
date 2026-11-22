import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRoomInventory extends Document {
  _id: mongoose.Types.ObjectId;
  room: mongoose.Types.ObjectId;
  date: string; // ISO date string "YYYY-MM-DD"
  bookedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const RoomInventorySchema = new Schema<IRoomInventory>(
  {
    room: { type: Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    date: { type: String, required: true, index: true }, // Format "YYYY-MM-DD"
    bookedCount: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true }
);

// Compound unique index for instant atomic date-room lookups
RoomInventorySchema.index({ room: 1, date: 1 }, { unique: true });

export const RoomInventory: Model<IRoomInventory> =
  mongoose.models.RoomInventory || mongoose.model<IRoomInventory>("RoomInventory", RoomInventorySchema);
