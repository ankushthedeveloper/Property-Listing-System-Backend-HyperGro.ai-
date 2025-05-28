import {
  createFavorite,
  deleteFavorite,
  getFavorites,
  updateFavorite,
} from "@controllers/favorite.controller";
import { verifyJWT } from "@middlewares/auth";
import { isFavoriteOwner } from "@middlewares/authorization";
import { asyncHandler } from "@utils/asyncHandler";
import { Router } from "express";

const router = Router();

router.use(verifyJWT);
router.route("/create").post(asyncHandler(createFavorite));
router.route("/").get(asyncHandler(getFavorites));

router.route("/update/:favoriteId").patch(isFavoriteOwner,updateFavorite);
router.route("/delete/:favoriteId").delete(isFavoriteOwner,deleteFavorite);
export default router;
