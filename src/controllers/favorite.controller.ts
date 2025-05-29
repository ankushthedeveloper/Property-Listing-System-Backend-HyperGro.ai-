import { StatusCode } from "@constants/common.constants";
import {
  allowedFieldsForFavoriteCreation,
  allowedFieldsForFavoriteUpdate,
  allowedPriorityForFavorite,
} from "@constants/controllers.constants";
import { ErrorMessages } from "@constants/error.constants";
import { favoriteResponse } from "@constants/response.constants";
import { getMiddlewareData } from "@middlewares/auth";
import { Favorite } from "@models/favorite";
import { ApiError, ApiResponse } from "@utils/apiResponse";
import redis from "@utils/redis";
import { Response } from "express";
import { validateObjectId } from "validations/commonValidations";
import crypto from "crypto";

export const createFavorite = async (req: any, res: Response) => {
  const { property } = req.body;
  validateObjectId(property);
  const existingFavorite = await Favorite.findOne({
    property,
    user: req.user._id,
  });
  if (existingFavorite) {
    throw new ApiError(
      StatusCode.BAD_REQUEST,
      ErrorMessages.FAVORITE_ALREADY_CREATED
    );
  }
  let query: any = {
    user: req.user._id,
    property,
  };
  query = await validationBeforeFavoriteCreation(req, query);

  const favorite = await Favorite.create(query);
  if (!favorite) {
    throw new ApiError(
      StatusCode.BAD_REQUEST,
      ErrorMessages.INTERNAL_SERVER_ERROR
    );
  }
  invalidateFavoriteCache(req.user._id);
  return new ApiResponse(
    StatusCode.CREATED,
    { favorite },
    { getMiddlewareData },
    favoriteResponse.CREATION_SUCCESS
  ).send(res);
};
export const getFavorites = async (req: any, res: Response) => {
  const userId = req.user?._id;
  const { priority, label } = req.query;

  const query: any = { user: userId };
  if (priority) {
    if (!allowedPriorityForFavorite.includes(priority.toLowerCase())) {
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        ErrorMessages.INVALID_PRIORITY
      );
    }
    query.priority = priority.toLowerCase();
  }
  if (label) {
    query.label = { $regex: label, $options: "i" };
  }

  const cacheKey = getFavoriteCacheKey(userId, req.query);
  const cached = await redis.get(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached);
    return new ApiResponse(
      StatusCode.SUCCESS,
      parsed,
      { getMiddlewareData },
      "[CACHE] Favorites fetched"
    ).send(res);
  }

  const favorites = await Favorite.find(query)
    .populate("property")
    .sort({ updatedAt: -1 });

  const response = { favorites };

  await redis.set(cacheKey, JSON.stringify(response), "EX", 3600); // 1 hour TTL

  return new ApiResponse(
    StatusCode.SUCCESS,
    response,
    { getMiddlewareData },
    favoriteResponse.FETCHED_SUCCESS
  ).send(res);
};
export const updateFavorite = async (req: any, res: Response) => {
  const { favoriteId } = req.params;
  const updates = validateFavoriteUpdate(req);
  const favorite = await Favorite.findOneAndUpdate(
    { _id: favoriteId },
    updates,
    { new: true }
  );
  if (!favorite) {
    throw new ApiError(StatusCode.NOT_FOUND, ErrorMessages.FAVORITE_NOT_FOUND);
  }
  invalidateFavoriteCache(req.user._id);
  return new ApiResponse(
    StatusCode.SUCCESS,
    { favorite },
    { getMiddlewareData },
    favoriteResponse.UPDATE_SUCCESS
  ).send(res);
};
export const deleteFavorite = async (req: any, res: Response) => {
  const userId = req.user?._id;

  const { favoriteId } = req.params;

  const deleted = await Favorite.findOneAndDelete({
    _id: favoriteId,
    user: userId,
  });

  if (!deleted) {
    throw new ApiError(StatusCode.NOT_FOUND, ErrorMessages.FAVORITE_NOT_FOUND);
  }
  invalidateFavoriteCache(req.user._id);
  return new ApiResponse(
    StatusCode.SUCCESS,
    {},
    {},
    "Favorite deleted successfully"
  ).send(res);
};

/****************************************************** Private Methods for Favorits *************************/

const validationBeforeFavoriteCreation = (req: any, query: any) => {
  if (req.body) {
    Object.keys(req.body).map((key: string) => {
      if (!allowedFieldsForFavoriteCreation.includes(key)) {
        throw new ApiError(
          StatusCode.BAD_REQUEST,
          `${ErrorMessages.INVALID_FIELD} : ${key}`
        );
      }
      if (req.body[key] && req.body[key].length > 0) {
        if (
          key === "priority" &&
          !allowedPriorityForFavorite.includes(req.body[key])
        ) {
          throw new ApiError(
            StatusCode.BAD_REQUEST,
            ErrorMessages.INVALID_PRIORITY
          );
        }
        query[key] = req.body[key];
      }
    });
  }
  return query;
};

const validateFavoriteUpdate = (req: Request) => {
  const updates: Record<string, any> = {};
  const body: any = req.body;

  if (!body || typeof body !== "object") {
    throw new ApiError(
      StatusCode.BAD_REQUEST,
      ErrorMessages.INVALID_REQUEST_BODY
    );
  }

  for (const key of Object.keys(body)) {
    if (!allowedFieldsForFavoriteUpdate.includes(key)) {
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        `${ErrorMessages.INVALID_FIELD} : ${key}`
      );
    }

    const value = body[key];

    if (key === "priority") {
      if (
        typeof value !== "string" ||
        !allowedPriorityForFavorite.includes(value)
      ) {
        throw new ApiError(
          StatusCode.BAD_REQUEST,
          ErrorMessages.INVALID_PRIORITY
        );
      }
    }

    updates[key] = value;
  }

  (req as any).updates = updates;

  return updates;
};

const getFavoriteCacheKey = (userId: string, query: any) => {
  const raw = JSON.stringify({ userId, ...query });
  const hash = crypto.createHash("md5").update(raw).digest("hex");
  return `favorites:${userId}:${hash}`;
};

const invalidateFavoriteCache = async (userId: string) => {
  const keys = await redis.keys(`favorites:${userId}:*`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
};
