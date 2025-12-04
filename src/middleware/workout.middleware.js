// Validation middleware for workout creation and updates
export const validateWorkoutInput = (req, res, next) => {
  const {
    title,
    bodyParts,
    difficulty,
    equipment,
    instructions,
    duration,
    calories,
    sets,
    reps,
    restTime
  } = req.body;

  const errors = [];

  // Validate optional fields if provided
  if (duration !== undefined) {
    if (!Number.isInteger(duration) || duration <= 0) {
      errors.push("Duration must be a positive integer (minutes)");
    }
  }

  if (calories !== undefined) {
    if (!Number.isInteger(calories) || calories < 0) {
      errors.push("Calories must be a non-negative integer");
    }
  }

  if (sets !== undefined) {
    if (!Number.isInteger(sets) || sets <= 0) {
      errors.push("Sets must be a positive integer");
    }
  }

  if (restTime !== undefined) {
    if (!Number.isInteger(restTime) || restTime < 0) {
      errors.push("Rest time must be a non-negative integer (seconds)");
    }
  }

  if (title && title.length > 100) {
    errors.push("Title must be 100 characters or less");
  }

  if (difficulty && !['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].includes(difficulty)) {
    errors.push("Difficulty must be one of: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT");
  }

  if (bodyParts && !Array.isArray(bodyParts)) {
    errors.push("Body parts must be an array");
  }

  if (equipment && !Array.isArray(equipment)) {
    errors.push("Equipment must be an array");
  }

  if (instructions && !Array.isArray(instructions)) {
    errors.push("Instructions must be an array");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: "Validation failed",
      errors
    });
  }

  next();
};

// Validation for query parameters
export const validateQueryParams = (req, res, next) => {
  const { page, limit, difficulty } = req.query;

  if (page && (!Number.isInteger(parseInt(page)) || parseInt(page) < 1)) {
    return res.status(400).json({ message: "Page must be a positive integer" });
  }

  if (limit && (!Number.isInteger(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({ message: "Limit must be between 1 and 100" });
  }

  if (difficulty && !['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].includes(difficulty)) {
    return res.status(400).json({ 
      message: "Difficulty must be one of: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT" 
    });
  }

  next();
};