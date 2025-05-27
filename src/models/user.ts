import { ServerError } from '@constants/error.constants';
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';
import { Document, model, Schema } from 'mongoose';

export interface IUser extends Document {
  _id:string | mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'user' | 'admin' | 'builder' | 'agent';
  isVerified: boolean;
  avatar?: string;
  refreshToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    phone: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'builder', 'agent'],
      default: 'user'
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    avatar: {
      type: String,
      default: ''
    },
    refreshToken: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);
UserSchema.methods.generateAccessToken = async function () {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error(ServerError.ACCESS_SECRET_ENV_NOT_FOUND);
  }
  if (!process.env.ACCESS_TOKEN_EXPIRY) {
    throw new Error(ServerError.ACCESS_EXPIRY_ENV_NOT_FOUND);
  }

  return jwt.sign({
    _id: this._id,
    name: this.name,
    phoneNumber: this.phoneNumber,
    email: this.email,
    role: this.role,
  },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    } as jwt.SignOptions);
}

UserSchema.methods.generateRefreshToken = async function () {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error(ServerError.REFRESH_SECRET_ENV_NOT_FOUND);
  }

  if (!process.env.REFRESH_TOKEN_EXPIRY) {
    throw new Error(ServerError.REFRESH_EXPIRY_ENV_NOT_FOUND);
  }

  return jwt.sign({
    _id: this._id,
  },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    } as jwt.SignOptions);
}

export const User = model<IUser>('User', UserSchema);