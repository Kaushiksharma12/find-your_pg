import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  bookingCode: string;
  user: mongoose.Types.ObjectId;
  property: mongoose.Types.ObjectId;
  room: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  checkInDate: Date;
  checkOutDate: Date;
  guestCount: number;
  monthlyRent: number;
  deposit: number;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED";
  paymentStatus: "PAY_ON_ARRIVAL" | "PENDING_OFFLINE" | "PAID";
  declineReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingCode: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    property: { type: Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    room: { type: Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    checkInDate: { type: Date, required: true, index: true },
    checkOutDate: { type: Date, required: true, index: true },
    guestCount: { type: Number, default: 1 },
    monthlyRent: { type: Number, required: true },
    deposit: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"],
      default: "PENDING",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["PAY_ON_ARRIVAL", "PENDING_OFFLINE", "PAID"],
      default: "PAY_ON_ARRIVAL",
    },
    declineReason: { type: String },
  },
  { timestamps: true }
);

BookingSchema.index({ room: 1, status: 1, checkInDate: 1, checkOutDate: 1 });

export const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
