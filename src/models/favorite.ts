import mongoose, { Document, Schema, model } from 'mongoose';

export interface IFavorite extends Document {
  user: mongoose.Types.ObjectId;
  property: mongoose.Types.ObjectId;
  label?: string;
  note?: string;
  priority?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    label: {
      type: String,
      maxlength: 30,
      trim: true,
    },
    note: {
      type: String,
      maxlength: 200,
      trim: true,
    },
    priority: {
      type: String,
      enum:["low","medium","high"],
      default:"low"
    }
  },
  {
    timestamps: true,
  }
);

FavoriteSchema.index({ user: 1, property: 1 }, { unique: true });

export const Favorite = model<IFavorite>('Favorite', FavoriteSchema);
