// Validation middleware for meal logging
export const validateMealInput = (req, res, next) => {
  const {
    mealType,
    mealDate,
    foodItem,
    servingSize,
    unit,
    calories,
    protein,
    carbs,
    fat
  } = req.body;

  const errors = [];

  // Validate optional fields if provided
  if (mealType && !['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'PRE_WORKOUT', 'POST_WORKOUT'].includes(mealType)) {
    errors.push("Meal type must be one of: BREAKFAST, LUNCH, DINNER, SNACK, PRE_WORKOUT, POST_WORKOUT");
  }

  if (mealDate) {
    const date = new Date(mealDate);
    if (isNaN(date.getTime())) {
      errors.push("Invalid meal date format");
    }
  }

  if (servingSize !== undefined && (isNaN(servingSize) || parseFloat(servingSize) <= 0)) {
    errors.push("Serving size must be a positive number");
  }

  if (calories !== undefined && (isNaN(calories) || parseFloat(calories) < 0)) {
    errors.push("Calories must be a non-negative number");
  }

  if (protein !== undefined && (isNaN(protein) || parseFloat(protein) < 0)) {
    errors.push("Protein must be a non-negative number");
  }

  if (carbs !== undefined && (isNaN(carbs) || parseFloat(carbs) < 0)) {
    errors.push("Carbohydrates must be a non-negative number");
  }

  if (fat !== undefined && (isNaN(fat) || parseFloat(fat) < 0)) {
    errors.push("Fat must be a non-negative number");
  }

  if (foodItem && foodItem.length > 100) {
    errors.push("Food item name must be 100 characters or less");
  }

  if (unit && unit.length > 20) {
    errors.push("Unit must be 20 characters or less");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: "Validation failed",
      errors
    });
  }

  next();
};

// Validation for nutrition query parameters
export const validateNutritionQueryParams = (req, res, next) => {
  const { page, limit, mealType, startDate, endDate, date, days } = req.query;

  if (page && (!Number.isInteger(parseInt(page)) || parseInt(page) < 1)) {
    return res.status(400).json({ message: "Page must be a positive integer" });
  }

  if (limit && (!Number.isInteger(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({ message: "Limit must be between 1 and 100" });
  }

  if (mealType && !['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'PRE_WORKOUT', 'POST_WORKOUT'].includes(mealType)) {
    return res.status(400).json({ 
      message: "Meal type must be one of: BREAKFAST, LUNCH, DINNER, SNACK, PRE_WORKOUT, POST_WORKOUT" 
    });
  }

  if (startDate) {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      return res.status(400).json({ message: "Invalid start date format" });
    }
  }

  if (endDate) {
    const end = new Date(endDate);
    if (isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid end date format" });
    }
  }

  if (date) {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }
  }

  if (days && (!Number.isInteger(parseInt(days)) || parseInt(days) < 1 || parseInt(days) > 365)) {
    return res.status(400).json({ message: "Days must be between 1 and 365" });
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return res.status(400).json({ message: "Start date must be before end date" });
    }
  }

  next();
};