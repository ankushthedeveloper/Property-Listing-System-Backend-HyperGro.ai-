import { UserPayload } from '@HyperTypes/commonTypes'; // adjust path accordingly

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}