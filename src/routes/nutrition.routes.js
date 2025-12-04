import express from "express";
import {
  logMeal,
  getUserMealLogs,
  getMealLogById,
  updateMealLog,
  deleteMealLog,
  getDailyNutritionSummary,
  getNutritionStats,
  quickAddMeal,
  getQuickMealPresets
} from "../controllers/nutrition.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validateMealInput, validateNutritionQueryParams } from "../middleware/nutrition.middleware.js";

const router = express.Router();

// All nutrition routes require authentication
router.use(protect);

// Quick meal presets
router.get("/presets", getQuickMealPresets);                          // GET /api/v1/nutrition/presets - Get quick meal presets
router.post("/quick-add", quickAddMeal);                              // POST /api/v1/nutrition/quick-add - Quick add predefined meal

// CRUD Operations
router.post("/", validateMealInput, logMeal);                         // POST /api/v1/nutrition - Log meal
router.get("/", validateNutritionQueryParams, getUserMealLogs);       // GET /api/v1/nutrition - Get user's meal logs
router.get("/stats", getNutritionStats);                              // GET /api/v1/nutrition/stats - Get nutrition statistics
router.get("/daily-summary", getDailyNutritionSummary);               // GET /api/v1/nutrition/daily-summary?date=2024-01-01 - Get daily summary
router.get("/:id", getMealLogById);                                   // GET /api/v1/nutrition/:id - Get specific meal log
router.put("/:id", validateMealInput, updateMealLog);                 // PUT /api/v1/nutrition/:id - Update meal log
router.delete("/:id", deleteMealLog);                                 // DELETE /api/v1/nutrition/:id - Delete meal log

export default router;