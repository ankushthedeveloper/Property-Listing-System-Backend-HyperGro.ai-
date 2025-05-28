import express from "express";
import { serveRoot } from "@controllers/root.controller";

const router = express.Router();

router.get("/", serveRoot);

export default router;
