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
import { Response } from "express";
import { validateObjectId } from "validations/commonValidations";

export const createFavorite = async (req: any, res: Response) => {
  const { property } = req.body;
  validateObjectId(property);
  let query: any = {
    user: req.user._id,
    property,
  };
  query = validationBeforeFavoriteCreation(req, query);

  const favorite = await Favorite.create(query);
  if (!favorite) {
    throw new ApiError(
      StatusCode.BAD_REQUEST,
      ErrorMessages.INTERNAL_SERVER_ERROR
    );
  }

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

  const favorites = await Favorite.find(query)
    .populate("property")
    .sort({ updatedAt: -1 });

  return new ApiResponse(
    StatusCode.SUCCESS,
    { favorites },
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
