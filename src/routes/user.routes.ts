import {
  loginUser,
  logoutUser,
  registerUser,
} from "@controllers/user.controller";
import { asyncHandler } from "@utils/asyncHandler";
import { Router } from "express";
import { verifyJWT } from "@middlewares/auth";

const router = Router();

router.route("/register").post(asyncHandler(registerUser));
router.route("/login").post(asyncHandler(loginUser));
router.route("/logout").post(verifyJWT, asyncHandler(logoutUser));

export default router;
