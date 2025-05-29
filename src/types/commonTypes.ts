import { Request } from "express";
import mongoose from "mongoose";

export interface UserPayload {
  _id:string| mongoose.Types.ObjectId;
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
export interface RequestWithUser<T = any> extends Request<T> {
  user?: UserPayload;
}