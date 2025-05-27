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

// Create Property
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

  return new ApiResponse(
    StatusCode.CREATED,
    { property: newProperty },
    {},
    propertyResponse.PROPERTY_CREATION_SUCCESS
  ).send(res);
};

export const getAllProperties = async (_req: Request, res: Response) => {
  const properties = await Property.find();

  return new ApiResponse(
    StatusCode.SUCCESS,
    { properties },
    {},
    propertyResponse.PROPERTY_FETCHED_SUCCESS
  ).send(res);
};

export const getPropertyById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCode.BAD_REQUEST, ErrorMessages.INVALID_ID);
  }

  const property = await Property.findById(id);
  if (!property) {
    throw new ApiError(StatusCode.NOT_FOUND, ErrorMessages.PROPERTY_NOT_FOUND);
  }

  return new ApiResponse(
    StatusCode.SUCCESS,
    { property },
    { getMiddlewareData },
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

  return new ApiResponse(
    StatusCode.SUCCESS,
    { property: updated },
    {},
    propertyResponse.PROPERTY_UPDATION_SUCCESS
  ).send(res);
};

// Delete Property
export const deleteProperty = async (req: Request, res: Response) => {
  const { propertyId } = req.params;

  validateObjectId(propertyId);

  const property = await Property.findById(propertyId);
  if (!property) {
    throw new ApiError(StatusCode.NOT_FOUND, ErrorMessages.PROPERTY_NOT_FOUND);
  }

  await Property.findByIdAndDelete(propertyId);

  return new ApiResponse(
    StatusCode.SUCCESS,
    {},
    {},
    propertyResponse.PROPERTY_DELETION_SUCCESS
  ).send(res);
};
