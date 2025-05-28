export const ServerError = {
  REFRESH_EXPIRY_ENV_NOT_FOUND: "REFRESH_TOKEN_EXPIRY is not defined ",
  ACCESS_EXPIRY_ENV_NOT_FOUND: "ACCESS_TOKEN_EXPIRY is not defined ",
  REFRESH_SECRET_ENV_NOT_FOUND: "REFRESH_TOKEN_SECRET is not defined",
  ACCESS_SECRET_ENV_NOT_FOUND: "ACCESS_TOKEN_SECRET is not defined",
  MISSING_ENV: "environment variable is missing",
};

export const ErrorMessages ={
  INVALID_REQUEST_BODY:"Invalid request body",
  INTERNAL_SERVER_ERROR:"Internal Server Error",
  MISSING_REQUIRED_FIELDS:"Missing required fields",
  
  INVALID_EMAIL_FORMAT:"Invalid email format",
  INVALID_NAME_FORMAT:"Invalid name format",
  INVALID_FORMAT:"Invalid format",
  INVALID_ID:"Invalid Id provided",

  EMAIL_EXISTS:"Email is already used",
  NOT_AUTHORIZED:"You are not Authorized to perform this action",
  CORS_ERROR:"Origin is not allowed",
  USER_NOT_FOUND:"User not found",

  INVALID_ACCESS_TOKEN: "Invalid access token",
  EXPIRED_ACCESS_TOKEN: "Expired access token",
  INVALID_REFRESH_TOKEN: "Invalid refresh token",
  INVALID_VERIFICATION_ACTION: "Invalid verification action",
  INVALID_VERIFICATION_EMAIL: "Invalid verification email",
  EXPIRED_REFRESH_TOKEN: "Refresh token expired",
  TOKEN_VERIFICATION_TOKEN: "Token verification failed",
  FORBIDDEN: "You are not authorized to perform this action",

  PROPERTY_NOT_FOUND:"Property not found",
  PROPERTY_EXISTS:"Property exists with provided ID",
  INVALID_FIELD:"Invalid field entered",
  INVALID_PRIORITY:"Invalid priority entered, Available Options : low , medium , high",
  FAVORITE_NOT_FOUND:"Favorite not found",

  ALREADY_RECOMMENDED:"You have already recommended the property to the user",
  SELF_RECOMMEND_NOT_ALLOWED:"Self recommend is not allowed , make the property favorite instead",
  RECOMMENDATION_NOT_FOUND:"Recommendation either deleted already or there is no recommendation",
  INVALID_RECOMMENDATION_STATUS:"Invalid status filter. Use sent or received."
}