import { Schema, model, Types } from "mongoose";

const RecommendationSchema = new Schema(
  {
    propertyId: { type: Types.ObjectId, ref: "Property", required: true },
    fromUserId: { type: Types.ObjectId, ref: "User", required: true },
    toUserId: { type: Types.ObjectId, ref: "User", required: true },
    note: { type: String },
  },
  { timestamps: true }
);

export const Recommendation = model("Recommendation", RecommendationSchema);
