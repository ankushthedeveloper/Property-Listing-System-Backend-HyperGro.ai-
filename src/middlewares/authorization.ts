import { StatusCode } from "@constants/common.constants";
import { ErrorMessages } from "@constants/error.constants";
import { Favorite } from "@models/favorite";
import { Recommendation } from "@models/recommendation";
import { ApiError } from "@utils/apiResponse";
import { asyncHandler } from "@utils/asyncHandler";
import { NextFunction, Response } from "express";
import { validateObjectId } from "validations/commonValidations";

export const isFavoriteOwner = asyncHandler(
    async (req: any, _res: Response, next: NextFunction) => {
      const {favoriteId}=req.params;
 
      const favorite=await Favorite.findById(favoriteId);
      if(!favorite){
        throw new ApiError(StatusCode.BAD_REQUEST,ErrorMessages.FAVORITE_NOT_FOUND);
      }
      if(favorite?.user.toString()!==req.user._id.toString()){
        throw new ApiError(StatusCode.UNAUTHORIZED,ErrorMessages.NOT_AUTHORIZED);
      }
      
      next();
    }
)
export const isRecommendationOwner = asyncHandler(
  async (req: any, _res: Response, next: NextFunction) => {
      const {recommendationId}=req.params;
      validateObjectId(recommendationId);
      const recommendation=await Recommendation.findById(recommendationId);
      if(!recommendation){
        throw new ApiError(StatusCode.BAD_REQUEST,ErrorMessages.RECOMMENDATION_NOT_FOUND);
      }
      if(recommendation?.fromUserId.toString()!==req.user._id.toString()){
        throw new ApiError(StatusCode.UNAUTHORIZED,ErrorMessages.NOT_AUTHORIZED);
      }
      req.recommendation=recommendation;
      next();
    }
)