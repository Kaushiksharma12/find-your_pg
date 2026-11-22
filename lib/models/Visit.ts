import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVisit extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  property: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  scheduledDate: Date;
  timeSlot: string;
  visitType: "PHYSICAL" | "VIRTUAL";
  note?: string;
  contactPerson?: string;
  status: "REQUESTED" | "CONFIRMED" | "RESCHEDULED" | "DECLINED" | "COMPLETED" | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
}

const VisitSchema = new Schema<IVisit>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    property: { type: Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    scheduledDate: { type: Date, required: true, index: true },
    timeSlot: { type: String, required: true },
    visitType: { type: String, enum: ["PHYSICAL", "VIRTUAL"], default: "PHYSICAL" },
    note: { type: String },
    contactPerson: { type: String },
    status: {
      type: String,
      enum: ["REQUESTED", "CONFIRMED", "RESCHEDULED", "DECLINED", "COMPLETED", "CANCELLED"],
      default: "REQUESTED",
      index: true,
    },
  },
  { timestamps: true }
);

export const Visit: Model<IVisit> =
  mongoose.models.Visit || mongoose.model<IVisit>("Visit", VisitSchema);
