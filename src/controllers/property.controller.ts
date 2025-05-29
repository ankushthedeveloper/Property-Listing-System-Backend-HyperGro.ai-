import { Request, Response } from "express";
import { Property } from "@models/property";
import { ApiError } from "@utils/apiResponse";
import { ApiResponse } from "@utils/apiResponse";
import { StatusCode } from "@constants/common.constants";
import mongoose from "mongoose";
import { propertyResponse } from "@constants/response.constants";
import { ErrorMessages } from "@constants/error.constants";
import { validateObjectId } from "validations/commonValidations";
import { getMiddlewareData } from "@middlewares/auth";
import crypto from "crypto";
import redis from "@utils/redis";
import { RequestWithUser } from "@HyperTypes/commonTypes";

export const createProperty = async (req: any, res: Response) => {
  const {
    id,
    title,
    type,
    price,
    state,
    city,
    areaSqFt,
    bedrooms,
    bathrooms,
    amenities,
    furnished,
    availableFrom,
    listedBy,
    tags,
    colorTheme,
    rating,
    isVerified,
    listingType,
  } = req.body;

  if (
    !id ||
    !title ||
    !type ||
    !price ||
    !state ||
    !city ||
    !areaSqFt ||
    bedrooms == null ||
    bathrooms == null ||
    !furnished ||
    !availableFrom ||
    !listedBy ||
    !listingType
  ) {
    throw new ApiError(
      StatusCode.BAD_REQUEST,
      ErrorMessages.MISSING_REQUIRED_FIELDS
    );
  }

  const existing = await Property.findOne({ id });
  if (existing) {
    throw new ApiError(StatusCode.BAD_REQUEST, ErrorMessages.PROPERTY_EXISTS);
  }

  const newProperty = await Property.create({
    id,
    title,
    type,
    price,
    state,
    city,
    areaSqFt,
    bedrooms,
    bathrooms,
    amenities,
    furnished,
    availableFrom,
    listedBy,
    tags,
    colorTheme,
    rating,
    isVerified,
    listingType,
    createdBy: req.user?._id,
  });

  if (!newProperty) {
    throw new ApiError(
      StatusCode.INTERNAL_SERVER_ERROR,
      ErrorMessages.INTERNAL_SERVER_ERROR
    );
  }
   const keys = await redis.keys("properties:*");
   if (keys.length > 0) await redis.del(...keys);
  return new ApiResponse(
    StatusCode.CREATED,
    { property: newProperty },
    {},
    propertyResponse.PROPERTY_CREATION_SUCCESS
  ).send(res);
};

export const getAllProperties = async (req: RequestWithUser, res: Response) => {
  const { query, sortBy, sortOrder, page, limit,keywords } = queryBuiler(req);
  const sortOptions: Record<string, 1 | -1> = {
    [sortBy as string]: sortOrder === "desc" ? -1 : 1,
  };
  const skip = (Number(page) - 1) * Number(limit);
  const rawCacheKey = JSON.stringify({
  userId: req.user?._id,
  keywords,
  titleOnly: true,
  sortOptions,
  skip,
  limit
})
  const cacheKey = `properties:${crypto
    .createHash("md5")
    .update(rawCacheKey)
    .digest("hex")}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    return new ApiResponse(
      StatusCode.SUCCESS,
      JSON.parse(cached),
      {},
      propertyResponse.CACHED_PROPERTY_FETCHED
    ).send(res);
  }

  const [properties, total] = await Promise.all([
    Property.find(query).sort(sortOptions).skip(skip).limit(Number(limit)),
    Property.countDocuments(query),
  ]);

  const data = {
    properties,
    total,
    currentPage: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
  };

  await redis.set(cacheKey, JSON.stringify(data), "EX", 3600);

  return new ApiResponse(
    StatusCode.SUCCESS,
    data,
    { getMiddlewareData },
    propertyResponse.PROPERTY_FETCHED_SUCCESS
  ).send(res);
};

export const getPropertyById = async (req: Request, res: Response) => {
  const { propertyId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    throw new ApiError(StatusCode.BAD_REQUEST, ErrorMessages.INVALID_ID);
  }

  const cacheKey = `property:${propertyId}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return new ApiResponse(
      StatusCode.SUCCESS,
      { property: JSON.parse(cached) },
      { getMiddlewareData },
      `${propertyResponse.PROPERTY_FETCHED_SUCCESS} (from cache)`
    ).send(res);
  }

  const property = await Property.findById(propertyId);
  if (!property) {
    throw new ApiError(StatusCode.NOT_FOUND, ErrorMessages.PROPERTY_NOT_FOUND);
  }

  await redis.set(cacheKey, JSON.stringify(property), "EX", 3600);

  return new ApiResponse(
    StatusCode.SUCCESS,
    { property },
    {},
    propertyResponse.PROPERTY_FETCHED_SUCCESS
  ).send(res);
};

export const updateProperty = async (req: Request, res: Response) => {
  const { propertyId } = req.params;

  validateObjectId(propertyId);
  const property = await Property.findById(propertyId);
  if (!property) {
    throw new ApiError(StatusCode.NOT_FOUND, ErrorMessages.PROPERTY_NOT_FOUND);
  }

  const forbidden = ["_id", "id"];
  forbidden.forEach((field) => delete req.body[field]);

  const updated = await Property.findByIdAndUpdate(propertyId, req.body, {
    new: true,
    runValidators: true,
  });
  if(!updated){
    throw new ApiError(StatusCode.INTERNAL_SERVER_ERROR,ErrorMessages.INTERNAL_SERVER_ERROR);
  }
  const keys = await redis.keys("properties:*");
  if (keys.length > 0) await redis.del(...keys);

  return new ApiResponse(
    StatusCode.SUCCESS,
    { property: updated },
    {},
    propertyResponse.PROPERTY_UPDATION_SUCCESS
  ).send(res);
};

export const deleteProperty = async (req: Request, res: Response) => {
  const { propertyId } = req.params;

  validateObjectId(propertyId);

  const property = await Property.findById(propertyId);
  if (!property) {
    throw new ApiError(StatusCode.NOT_FOUND, ErrorMessages.PROPERTY_NOT_FOUND);
  }

  await Property.findByIdAndDelete(propertyId);
  const keys = await redis.keys("properties:*");
  if (keys.length > 0) await redis.del(...keys);
  return new ApiResponse(
    StatusCode.SUCCESS,
    {},
    {},
    propertyResponse.PROPERTY_DELETION_SUCCESS
  ).send(res);
};

/********************************* Private Methods ********************************************************/
const queryBuiler = (req: RequestWithUser) => {
  const {
    type,
    state,
    city,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    furnished,
    areaMin,
    areaMax,
    listedBy,
    keywords,
    sortBy = "createdAt",
    sortOrder = "desc",
    availableFrom,
    page = 1,
    limit = 10,
  } = req.query;

  const query: Record<string, any> = {};

  if (type) query.type = type;
  if (state) query.state = new RegExp(state as string, "i");
  if (city) query.city = new RegExp(city as string, "i");
  if (bedrooms) query.bedrooms = Number(bedrooms);
  if (bathrooms) query.bathrooms = Number(bathrooms);
  if (furnished) query.furnished = furnished;
  if (listedBy) query.listedBy = listedBy;

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (areaMin || areaMax) {
    query.areaSqFt = {};
    if (areaMin) query.areaSqFt.$gte = Number(areaMin);
    if (areaMax) query.areaSqFt.$lte = Number(areaMax);
  }

  if (keywords) {
    const regex = new RegExp(keywords as string, "i");
    query.$or = [
      { title: regex },
      { tags: regex },
      { state: regex },
      { city: regex },
      { amenities: regex },

    ];
  }
  if (availableFrom) {
    const availableFromDate = new Date(availableFrom as string);
    if (!isNaN(availableFromDate.getTime())) {
      query.availableFrom = { $gte: availableFromDate };
    }
  }
  return { query, sortBy, sortOrder, page, limit, keywords };
};
