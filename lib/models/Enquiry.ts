import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEnquiryMessage {
  sender: mongoose.Types.ObjectId;
  message: string;
  sentAt: Date;
}

export interface IEnquiry extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  property: mongoose.Types.ObjectId;
  room?: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  subject?: string;
  messages: IEnquiryMessage[];
  status: "OPEN" | "REPLIED" | "RESOLVED" | "CLOSED";
  createdAt: Date;
  updatedAt: Date;
}

const EnquirySchema = new Schema<IEnquiry>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    property: { type: Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    room: { type: Schema.Types.ObjectId, ref: "Room" },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: String, default: "Property Enquiry" },
    messages: [
      {
        sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
        message: { type: String, required: true },
        sentAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["OPEN", "REPLIED", "RESOLVED", "CLOSED"],
      default: "OPEN",
      index: true,
    },
  },
  { timestamps: true }
);

export const Enquiry: Model<IEnquiry> =
  mongoose.models.Enquiry || mongoose.model<IEnquiry>("Enquiry", EnquirySchema);
