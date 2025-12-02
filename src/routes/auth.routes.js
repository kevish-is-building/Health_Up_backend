import express from "express";
import { registerUser, loginUser, logoutUser, refreshToken, googleAuth } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", protect, logoutUser);
router.post("/refresh", refreshToken);
router.post("/google", googleAuth);

router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

export default router;
