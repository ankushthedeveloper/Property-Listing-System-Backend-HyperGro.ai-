import {
  AuthHeaderTokens,
  removeSensitiveData,
} from "@constants/auth.constants";
import { commonCacheKey, StatusCode } from "@constants/common.constants";
import { ErrorMessages } from "@constants/error.constants";
import { userResponse } from "@constants/response.constants";
import { UserPayload } from "@HyperTypes/commonTypes";
import { getMiddlewareData } from "@middlewares/auth";
import { User } from "@models/user";
import { ApiError, ApiResponse } from "@utils/apiResponse";
import redis from "@utils/redis";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { validateEmail, validateName } from "validations/commonValidations";
export const generateAccessAndRefreshTokenForUser = async (id: string) => {
  const user: any = await User.findById(id);

  if (!user) {
    throw new ApiError(StatusCode.UNAUTHORIZED, ErrorMessages.NOT_AUTHORIZED);
  }

  const accessToken = await user.generateAccessToken();

  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

export const registerUser = async (req: Request, res: Response) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    throw new ApiError(
      StatusCode.BAD_REQUEST,
      ErrorMessages.MISSING_REQUIRED_FIELDS
    );
  }
  validateName(name);
  validateEmail(email);
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(StatusCode.BAD_REQUEST, ErrorMessages.EMAIL_EXISTS);
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser: UserPayload = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  if (!newUser) {
    throw new ApiError(
      StatusCode.INTERNAL_SERVER_ERROR,
      ErrorMessages.INTERNAL_SERVER_ERROR
    );
  }
  await redis.del(commonCacheKey.users);
  const { refreshToken, accessToken } =
    await generateAccessAndRefreshTokenForUser(newUser._id.toString());

  return new ApiResponse(
    StatusCode.CREATED,
    {
      user: newUser,
      accessToken: {
        name: AuthHeaderTokens.AUTHORIZATION,
        value: accessToken,
      },
      refreshToken: {
        name: AuthHeaderTokens.REFRESH_TOKEN,
        value: refreshToken,
      },
    },
    {},
    userResponse.REGISTER_SUCCESS
  ).send(res);
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new ApiError(
      StatusCode.BAD_REQUEST,
      ErrorMessages.MISSING_REQUIRED_FIELDS
    );
  const user: any = await User.findOne({ email });
  if (!user)
    throw new ApiError(StatusCode.NOT_FOUND, ErrorMessages.USER_NOT_FOUND);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(
      StatusCode.BAD_REQUEST,
      ErrorMessages.EMAIL_OR_PASSWORD_INVALID
    );
  }
  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokenForUser(user._id);
  user.refreshToken = refreshToken;
  await user.save();
  return new ApiResponse(StatusCode.SUCCESS, {
    user,
    accessToken: {
      name: AuthHeaderTokens.AUTHORIZATION,
      value: accessToken,
    },
    refreshToken: {
      name: AuthHeaderTokens.REFRESH_TOKEN,
      value: refreshToken,
    },
  }).send(res);
};

// to get users for refrence (one simple Additional Api for inspection usecase)
export const getUsers = async (req: Request, res: Response) => {
  const users = await User.find().select(removeSensitiveData);
  const cached = await redis.get(commonCacheKey.users);
  if (cached) {
    return new ApiResponse(
      StatusCode.SUCCESS,
      JSON.parse(cached),
      {},
      `[cached] ${userResponse.USER_FETCHED}`
    ).send(res);
  }
  const response ={users}
  await redis.set(commonCacheKey.users, JSON.stringify(response), "EX", 3600);
  return new ApiResponse(
    StatusCode.SUCCESS,
    { users },
    { getMiddlewareData },
    userResponse.USER_FETCHED
  ).send(res);
};
// logout user
export const logoutUser = async (req: any, res: any) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null }).lean();
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  return new ApiResponse(StatusCode.NO_CONTENT, {}).send(res);
};
