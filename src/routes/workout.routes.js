import express from "express";
import {
  createWorkout,
  getUserWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  getWorkoutStats,
  searchWorkouts
} from "../controllers/workout.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validateWorkoutInput, validateQueryParams } from "../middleware/workout.middleware.js";

const router = express.Router();

// All workout routes require authentication
router.use(protect);

// CRUD Operations
router.post("/", validateWorkoutInput, createWorkout);                    // POST /api/v1/workouts - Create workout
router.get("/", validateQueryParams, getUserWorkouts);                   // GET /api/v1/workouts - Get user's workouts
router.get("/stats", getWorkoutStats);                                   // GET /api/v1/workouts/stats - Get workout statistics
router.get("/search", validateQueryParams, searchWorkouts);              // GET /api/v1/workouts/search - Search workouts
router.get("/:id", getWorkoutById);                                      // GET /api/v1/workouts/:id - Get specific workout
router.put("/:id", validateWorkoutInput, updateWorkout);                 // PUT /api/v1/workouts/:id - Update workout
router.delete("/:id", deleteWorkout);                                    // DELETE /api/v1/workouts/:id - Delete workout

export default router;