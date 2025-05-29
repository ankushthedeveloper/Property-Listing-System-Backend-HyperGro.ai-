import { StatusCode } from "@constants/common.constants";
import { allowedStatusForRecommendationFetching } from "@constants/controllers.constants";
import { ErrorMessages } from "@constants/error.constants";
import { recommendationResponse } from "@constants/response.constants";
import { RequestWithUser } from "@HyperTypes/commonTypes";
import { getMiddlewareData } from "@middlewares/auth";
import { Recommendation } from "@models/recommendation";
import { User } from "@models/user";
import { ApiError, ApiResponse } from "@utils/apiResponse";
import redis from "@utils/redis";
import { Response } from "express";

export const createRecommendation = async (req: RequestWithUser, res: Response) => {
  const fromUserId = req.user?._id;
  const { propertyId, receiverEmail, note } = req.body;
  if (!propertyId || !receiverEmail) {
    throw new ApiError(
      StatusCode.BAD_REQUEST,
      ErrorMessages.MISSING_REQUIRED_FIELDS
    );
  }

  const receiver = await User.findOne({ email: receiverEmail });
  if (!receiver) {
    throw new ApiError(StatusCode.BAD_REQUEST, ErrorMessages.USER_NOT_FOUND);
  }
  const toUserId = receiver._id;
  if (fromUserId?.toString() === toUserId.toString()) {
    throw new ApiError(
      StatusCode.BAD_REQUEST,
      ErrorMessages.SELF_RECOMMEND_NOT_ALLOWED
    );
  }
  const existingRecommendation = await Recommendation.findOne({
    toUserId,
    fromUserId,
    propertyId,
  });
  if (existingRecommendation) {
    throw new ApiError(
      StatusCode.BAD_REQUEST,
      ErrorMessages.ALREADY_RECOMMENDED
    );
  }

  const recommendation = await Recommendation.create({
    propertyId,
    fromUserId,
    toUserId,
    note,
  });
  if (!recommendation) {
    throw new ApiError(
      StatusCode.INTERNAL_SERVER_ERROR,
      ErrorMessages.INTERNAL_SERVER_ERROR
    );
  }
  await invalidateRecommendationCache(fromUserId!.toString());
  await invalidateRecommendationCache(toUserId.toString());
  return new ApiResponse(
    StatusCode.CREATED,
    { recommendation },
    { getMiddlewareData },
    recommendationResponse.RECOMMENDATION_SENT
  ).send(res);
};

export const getRecommendations = async (req: any, res: Response) => {
  const userId = req.user?._id;
  const { status } = req.query;

  if (!userId) {
    throw new ApiError(StatusCode.UNAUTHORIZED, ErrorMessages.NOT_AUTHORIZED);
  }

  if (
    status &&
    !allowedStatusForRecommendationFetching.includes(status.toLowerCase())
  ) {
    throw new ApiError(
      StatusCode.BAD_REQUEST,
      ErrorMessages.INVALID_RECOMMENDATION_STATUS
    );
  }

  const query: any =
    status?.toLowerCase() === "sent"
      ? { fromUserId: userId }
      : status?.toLowerCase() === "received"
      ? { toUserId: userId }
      : { toUserId: userId };

  const cacheKey = getRecommendationCacheKey(userId, status);
  const cached = await redis.get(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached);
    return new ApiResponse(
      StatusCode.SUCCESS,
      parsed,
      {},
      "[CACHE] " + recommendationResponse.RECOMMENDATION_FETCHED_SUCCESS
    ).send(res);
  }

  const recommendations = await Recommendation.find(query)
    .populate("propertyId")
    .populate("fromUserId", "name email")
    .populate("toUserId", "name email")
    .sort({ createdAt: -1 });

  const response = { recommendations };

  await redis.set(cacheKey, JSON.stringify(response), "EX", 3600); // 1 hour TTL

  return new ApiResponse(
    StatusCode.SUCCESS,
    response,
    {},
    recommendationResponse.RECOMMENDATION_FETCHED_SUCCESS
  ).send(res);
};

export const updateRecommendation = async (req: any, res: Response) => {
  const { recommendationId } = req.params;
  const { note } = req.body;
  const recommendation = await Recommendation.findByIdAndUpdate(
    recommendationId,
    { note },
    { new: true }
  );
  if (!recommendation) {
    throw new ApiError(
      StatusCode.INTERNAL_SERVER_ERROR,
      ErrorMessages.INTERNAL_SERVER_ERROR
    );
  }
  await invalidateRecommendationCache(recommendation.fromUserId.toString());
  await invalidateRecommendationCache(recommendation.toUserId.toString());
  return new ApiResponse(
    StatusCode.SUCCESS,
    { recommendation },
    {},
    recommendationResponse.RECOMMENDATION_UPDATE_SUCCESS
  ).send(res);
};

export const deleteRecommendation = async (req: any, res: Response) => {
  const { recommendationId } = req.params;
  const deleted = await Recommendation.findOneAndDelete({
    _id: recommendationId,
  });

  if (!deleted) {
    throw new ApiError(
      StatusCode.NOT_FOUND,
      ErrorMessages.RECOMMENDATION_NOT_FOUND
    );
  }
  await invalidateRecommendationCache(deleted.fromUserId.toString());
  await invalidateRecommendationCache(deleted.toUserId.toString());
  return new ApiResponse(
    StatusCode.SUCCESS,
    {},
    { getMiddlewareData },
    recommendationResponse.RECOMMENDATION_DELETED_SUCCESS
  ).send(res);
};

/*********************** Private Methods************************************* */

const getRecommendationCacheKey = (userId: string, status?: string) => {
  return `recommendations:${userId}:${status?.toLowerCase() || "all"}`;
};

const invalidateRecommendationCache = async (userId: string) => {
  const keys = await redis.keys(`recommendations:${userId}:*`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
};
