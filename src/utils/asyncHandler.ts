import { Request, Response, NextFunction } from "express";

import { ApiError } from "@utils/apiResponse";
import { ErrorMessages} from "@constants/error.constants";
import { StatusCode } from "@constants/common.constants";

const asyncHandler = (
  requestHandler: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(requestHandler(req, res, next)).catch((error: unknown) => {
      if (error instanceof ApiError) {
        error.send(res);
      } else {
        const message = error instanceof Error ? error.message : String(error);
        new ApiError(
          StatusCode.INTERNAL_SERVER_ERROR,
          message || ErrorMessages.INTERNAL_SERVER_ERROR,
          error instanceof Error ? [error.message] : [error],
          error instanceof Error ? error.stack : undefined
        ).send(res);
      }
    });
  };
};


export { asyncHandler };
