import { Request, Response, NextFunction } from "express";
import mongoSanitize from "express-mongo-sanitize";

const cleanObject = (obj: any): any => {
  if (typeof obj !== "object" || obj === null) return obj;
  
  if (Array.isArray(obj)) return obj.map(cleanObject);

  const cleanedObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (key === "__proto__" || key === "constructor") continue;
      cleanedObj[key] = cleanObject(obj[key]);
    }
  }
  return cleanedObj;
};

const mongoSanitizeMiddleware = [
  mongoSanitize({ allowDots: false, replaceWith: '_' }),

  (req: Request, res: Response, next: NextFunction) => {
    req.body = cleanObject(req.body);
    req.query = cleanObject(req.query);
    req.params = cleanObject(req.params);
    next();
  }
];

export default mongoSanitizeMiddleware;
