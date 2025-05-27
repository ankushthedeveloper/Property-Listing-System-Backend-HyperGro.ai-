import mongoose, { Document, model, Schema } from "mongoose";

export interface IProperty extends Document {
  id: string;
  title: string;
  type: "Apartment" | "Villa" | "Bungalow" | "Plot" | "Studio";
  price: number;
  state: string;
  city: string;
  areaSqFt: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  furnished: "Furnished" | "Semi-Furnished" | "Unfurnished";
  availableFrom: Date;
  listedBy: "Owner" | "Agent" | "Builder";
  tags: string[];
  colorTheme: string;
  rating: number;
  isVerified: boolean;
  listingType: "sale" | "rent";
  createdAt?: Date;
  updatedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
}

const PropertySchema: Schema<IProperty> = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Apartment", "Villa", "Bungalow", "Plot", "Studio"],
    },
    price: {
      type: Number,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    areaSqFt: {
      type: Number,
      required: true,
    },
    bedrooms: {
      type: Number,
      required: true,
    },
    bathrooms: {
      type: Number,
      required: true,
    },
    amenities: {
      type: [String],
      default: [],
      set: (val: string | string[]) =>
        typeof val === "string" ? val.split("|") : val,
    },
    furnished: {
      type: String,
      enum: ["Furnished", "Semi-Furnished", "Unfurnished"],
      required: true,
    },
    availableFrom: {
      type: Date,
      required: true,
    },
    listedBy: {
      type: String,
      enum: ["Owner", "Agent", "Builder"],
      required: true,
    },
    tags: {
      type: [String],
      default: [],
      set: (val: string | string[]) =>
        typeof val === "string" ? val.split("|") : val,
    },
    colorTheme: {
      type: String,
      default: "#ffffff",
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    listingType: {
      type: String,
      enum: ["sale", "rent"],
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Property = model<IProperty>("Property", PropertySchema);
