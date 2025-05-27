import { StatusCode } from "@constants/common.constants";
import { ApiError } from "./apiResponse";
import { JsonWebTokenError, JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { ErrorMessages } from "@constants/error.constants";
import { AuthHeaderTokens } from "@constants/auth.constants";
import jwt from "jsonwebtoken";
import { User } from "@models/user";
import { generateAccessAndRefreshTokenForUser } from "@controllers/user.controller";
// Helper to verify JWT tokens
export const verifyAccessToken = (token: string, secret: string): JwtPayload => {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new ApiError(StatusCode.UNAUTHORIZED, ErrorMessages.EXPIRED_ACCESS_TOKEN);
    } else if (error instanceof JsonWebTokenError) {
      throw new ApiError(StatusCode.UNAUTHORIZED, ErrorMessages.INVALID_ACCESS_TOKEN);
    }
    throw new ApiError(StatusCode.INTERNAL_SERVER_ERROR, ErrorMessages.TOKEN_VERIFICATION_TOKEN);
  }
};

export const verifyRefreshToken = (token: string, secret: string): JwtPayload => {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new ApiError(StatusCode.UNAUTHORIZED, ErrorMessages.EXPIRED_REFRESH_TOKEN);
    } else if (error instanceof JsonWebTokenError) {
      throw new ApiError(StatusCode.UNAUTHORIZED, ErrorMessages.INVALID_REFRESH_TOKEN);
    }
    throw new ApiError(StatusCode.INTERNAL_SERVER_ERROR, ErrorMessages.TOKEN_VERIFICATION_TOKEN);
  }
};

// Helper to extract tokens from headers
export const getTokensFromHeaders = (req: any) => {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.startsWith(AuthHeaderTokens.BEARER) ? authHeader.split(" ")[1] : null;
  const refreshToken = req.headers[AuthHeaderTokens.REFRESH_TOKEN] ||  null;
  const authId = req.headers[AuthHeaderTokens.AUTHID] ?? null;

  return { accessToken, refreshToken, authId };
};

export const refreshTokenRotationUtil = (async (req: any) => {
  const refreshToken = req.header?.(AuthHeaderTokens.REFRESH_TOKEN) ?? null

  if (!refreshToken) throw new ApiError(StatusCode.UNAUTHORIZED, ErrorMessages.NOT_AUTHORIZED)

  const decodedToken = await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload
  if (!decodedToken._id) {
    throw new ApiError(StatusCode.UNAUTHORIZED, ErrorMessages.NOT_AUTHORIZED);
  }

  const user:any = await User.findById(decodedToken._id)
  if (!user || !user.refreshToken) {
    throw new ApiError(StatusCode.UNAUTHORIZED, ErrorMessages.NOT_AUTHORIZED);
  }

  if (user.refreshToken !== refreshToken) {
    throw new ApiError(StatusCode.UNAUTHORIZED, ErrorMessages.NOT_AUTHORIZED);
  }

  const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokenForUser(user._id)

  return { accessToken, refreshToken: newRefreshToken, user: user }
})