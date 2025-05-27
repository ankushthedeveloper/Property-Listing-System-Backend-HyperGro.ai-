import DOMPurify from "dompurify";
import { NextFunction, Request, Response } from "express";
import { JSDOM } from "jsdom";

import { commonTypes } from "@constants/common.constants";

const window = new JSDOM("").window;
const purify = DOMPurify(window);

// Sanitize a single string
const sanitizeValue = (value: any): any => {
  if (typeof value === commonTypes.String) {
    return purify.sanitize(value);
  } else if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  } else if (typeof value === commonTypes.Object && value !== null) {
    for (const key in value) {
      value[key] = sanitizeValue(value[key]);
    }
    return value;
  }
  return value;
};

const DomPurifyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  sanitizeValue(req.body);  
  sanitizeValue(req.params);
  sanitizeValue(req.query); 
  next();
};

export default DomPurifyMiddleware;
