import { StatusCode, UserRegex } from "@constants/common.constants";
import { ErrorMessages } from "@constants/error.constants";
import { ApiError } from "@utils/apiResponse";
import mongoose from "mongoose";

export const validateEmail = (email: string) => {
  const emailRegex = UserRegex.email;
  if (email && !emailRegex.test(email)) {
    throw new ApiError(StatusCode.BAD_REQUEST, ErrorMessages.INVALID_EMAIL_FORMAT);
  }
  return true;
};
export const validateName= (name: string) => {
  const nameRegex = UserRegex.name;
  if (name &&!nameRegex.test(name)) {
    throw new ApiError(StatusCode.BAD_REQUEST, ErrorMessages.INVALID_NAME_FORMAT);
  }
}

export const validateObjectId = (id: string) => {
  if (!id) {
    throw new ApiError(StatusCode.BAD_REQUEST, ErrorMessages.INVALID_FORMAT);
  }

  const isObjectId = mongoose.Types.ObjectId.isValid(id);

  if (!isObjectId) {
    throw new ApiError(StatusCode.BAD_REQUEST, ErrorMessages.INVALID_ID);
  }

  return true;
}