// routes/propertyRoutes.ts
import express from "express";
import {
  createProperty,
  getAllProperties,
  updateProperty,
  deleteProperty,
  getPropertyById,
} from "@controllers/property.controller";
import { verifyJWT } from "@middlewares/auth";
import { asyncHandler } from "@utils/asyncHandler";
import { validateRequest } from "@middlewares/zod";
import { createPropertySchema } from "zodSchemas/property.schema";
import { isPropertyOwner } from "@middlewares/authorization";

const router = express.Router();
router.route("/").get(asyncHandler(getAllProperties));
router.use(verifyJWT);
router
  .route("/")
  .post(validateRequest(createPropertySchema), asyncHandler(createProperty));
router.route("/:propertyId").get(asyncHandler(getPropertyById));
router
  .route("/update/:propertyId")
  .patch(isPropertyOwner, asyncHandler(updateProperty));
router
  .route("/delete/:propertyId")
  .delete(isPropertyOwner, asyncHandler(deleteProperty));

export default router;
