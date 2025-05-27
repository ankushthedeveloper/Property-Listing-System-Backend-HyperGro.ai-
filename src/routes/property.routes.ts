// routes/propertyRoutes.ts
import express from "express";
import {
  createProperty,
  getAllProperties,
  updateProperty,
  deleteProperty,
} from "@controllers/property.controller";
import { isPropertyOwner, verifyJWT } from "@middlewares/auth";
import { asyncHandler } from "@utils/asyncHandler";

const router = express.Router();
router.route("/").get(asyncHandler(getAllProperties));
router.use(verifyJWT);
router.route("/").post(asyncHandler(createProperty));

router
  .route("/update/:propertyId")
  .patch(isPropertyOwner, asyncHandler(updateProperty));
router
  .route("/delete/:propertyId")
  .delete(isPropertyOwner, asyncHandler(deleteProperty));

export default router;
