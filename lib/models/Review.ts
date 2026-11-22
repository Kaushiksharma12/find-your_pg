import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  booking: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  property: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  ownerReply?: {
    comment: string;
    repliedAt: Date;
  };
  status: "PUBLISHED" | "FLAGGED" | "REMOVED";
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    property: { type: Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, minlength: 10 },
    ownerReply: {
      comment: { type: String },
      repliedAt: { type: Date, default: Date.now },
    },
    status: {
      type: String,
      enum: ["PUBLISHED", "FLAGGED", "REMOVED"],
      default: "PUBLISHED",
      index: true,
    },
  },
  { timestamps: true }
);

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
