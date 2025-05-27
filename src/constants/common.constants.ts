
export const EnvironmentVariables = [
  'PORT',
  'MONGO_DB_URL',
  'CORS_ORIGIN',
  'NODE_ENV',
  'ACCESS_TOKEN_SECRET',
  'ACCESS_TOKEN_EXPIRY',
  'REFRESH_TOKEN_SECRET',
  'REFRESH_TOKEN_EXPIRY',
  'JWT_SECRET',
  'DB_NAME'
]

export enum StatusCode {
  SUCCESS = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
}

export const UserRegex = {
  phone_number: /^[0-9]+$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  name: /^[A-Za-z]+(?: [A-Za-z]+)*$/,
  secretKey:/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6}$/
};

export const commonTypes={
  String: "string",
  Object: "object",
}