import { createRecommendation, deleteRecommendation, getRecommendations, updateRecommendation } from "@controllers/recommendation.controller";
import { verifyJWT } from "@middlewares/auth";
import { isRecommendationOwner } from "@middlewares/authorization";
import { asyncHandler } from "@utils/asyncHandler";
import { Router } from "express";

const router = Router();

router.use(verifyJWT);
router.route("/create").post(asyncHandler(createRecommendation));
router.route("/").get(asyncHandler(getRecommendations));

router.route("/update/:recommendationId").patch(isRecommendationOwner,updateRecommendation);
router.route("/delete/:recommendationId").delete(isRecommendationOwner,deleteRecommendation);
export default router;
