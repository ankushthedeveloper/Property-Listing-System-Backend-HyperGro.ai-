// import { StatusCode } from "@constants/common.constants";
// import { ErrorMessages } from "@constants/error.constants";
// import { Favorite } from "@models/favorite";
// import { Property } from "@models/property";
// import { ApiError } from "@utils/apiResponse";
// import { NextFunction } from "express";

// export const isPropertyOwner= asyncHandler(
//      async (req: any, res: Response, next: NextFunction) => {
//       const {propertyId}=req.params;
//       const property=await Property.findById(propertyId);
//       if(!property){
//         throw new ApiError(StatusCode.BAD_REQUEST,ErrorMessages.PROPERTY_NOT_FOUND);
//       }
//       if(property?.createdBy.toString()!==req.user._id.toString()){
//         throw new ApiError(StatusCode.UNAUTHORIZED,ErrorMessages.NOT_AUTHORIZED);
//       }
      
//       next();
//     }
// )
// export const isFavoriteOwner = asyncHandler(
//     async (req: any, res: Response, next: NextFunction) => {
//       const {favoriteId}=req.params;
 
//       const favorite=await Favorite.findById(favoriteId);
//       if(!favorite){
//         throw new ApiError(StatusCode.BAD_REQUEST,ErrorMessages.FAVORITE_NOT_FOUND);
//       }
//       if(favorite?.user.toString()!==req.user._id.toString()){
//         throw new ApiError(StatusCode.UNAUTHORIZED,ErrorMessages.NOT_AUTHORIZED);
//       }
      
//       next();
//     }
// )

// function asyncHandler(arg0: (req: any, res: Response, next: NextFunction) => Promise<void>) {
//     throw new Error("Function not implemented.");
// }
