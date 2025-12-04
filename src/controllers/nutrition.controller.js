import prisma from "../config/prisma.js";

// Log a new meal
export const logMeal = async (req, res) => {
  try {
    const {
      mealType,
      mealDate,
      foodItem,
      servingSize,
      unit,
      calories,
      protein,
      carbs,
      fat,
      notes
    } = req.body;

    const userId = req.user.id;

    const mealLog = await prisma.mealLog.create({
      data: {
        mealType: mealType.toUpperCase(),
        mealDate: mealDate ? new Date(mealDate) : new Date(),
        foodItem,
        servingSize: servingSize ? parseFloat(servingSize) : null,
        unit,
        calories: calories ? parseFloat(calories) : null,
        protein: protein ? parseFloat(protein) : null,
        carbs: carbs ? parseFloat(carbs) : null,
        fat: fat ? parseFloat(fat) : null,
        notes,
        userId
      },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        }
      }
    });

    res.status(201).json({
      message: "Meal logged successfully",
      mealLog
    });
  } catch (error) {
    console.error("Log meal error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user's meal logs with filtering and pagination
export const getUserMealLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 10, 
      mealType, 
      startDate, 
      endDate,
      foodItem 
    } = req.query;

    const skip = (page - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build filter conditions
    const where = { userId };
    
    if (mealType) {
      where.mealType = mealType;
    }
    
    if (startDate || endDate) {
      where.mealDate = {};
      if (startDate) {
        where.mealDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.mealDate.lte = new Date(endDate);
      }
    }

    if (foodItem) {
      where.foodItem = {
        contains: foodItem,
        mode: 'insensitive'
      };
    }

    const [mealLogs, totalCount] = await Promise.all([
      prisma.mealLog.findMany({
        where,
        skip,
        take,
        orderBy: { mealDate: 'desc' },
        include: {
          user: {
            select: { id: true, username: true, email: true }
          }
        }
      }),
      prisma.mealLog.count({ where })
    ]);

    res.json({
      mealLogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / take),
        totalCount,
        hasNext: skip + take < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Get meal logs error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a specific meal log by ID
export const getMealLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const mealLog = await prisma.mealLog.findFirst({
      where: {
        id,
        userId // Ensure user can only access their own meal logs
      },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        }
      }
    });

    if (!mealLog) {
      return res.status(404).json({ message: "Meal log not found" });
    }

    res.json({ mealLog });
  } catch (error) {
    console.error("Get meal log by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a meal log
export const updateMealLog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Check if meal log exists and belongs to user
    const existingMealLog = await prisma.mealLog.findFirst({
      where: { id, userId }
    });

    if (!existingMealLog) {
      return res.status(404).json({ message: "Meal log not found" });
    }

    // Convert numeric fields to proper types
    const processedData = { ...updateData };
    if (processedData.servingSize) processedData.servingSize = parseFloat(processedData.servingSize);
    if (processedData.calories) processedData.calories = parseFloat(processedData.calories);
    if (processedData.protein) processedData.protein = parseFloat(processedData.protein);
    if (processedData.carbs) processedData.carbs = parseFloat(processedData.carbs);
    if (processedData.fat) processedData.fat = parseFloat(processedData.fat);
    if (processedData.mealDate) processedData.mealDate = new Date(processedData.mealDate);

    // Remove undefined values from updateData
    const cleanedUpdateData = Object.fromEntries(
      Object.entries(processedData).filter(([_, value]) => value !== undefined)
    );

    const updatedMealLog = await prisma.mealLog.update({
      where: { id },
      data: {
        ...cleanedUpdateData,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        }
      }
    });

    res.json({
      message: "Meal log updated successfully",
      mealLog: updatedMealLog
    });
  } catch (error) {
    console.error("Update meal log error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a meal log
export const deleteMealLog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if meal log exists and belongs to user
    const existingMealLog = await prisma.mealLog.findFirst({
      where: { id, userId }
    });

    if (!existingMealLog) {
      return res.status(404).json({ message: "Meal log not found" });
    }

    await prisma.mealLog.delete({
      where: { id }
    });

    res.json({ message: "Meal log deleted successfully" });
  } catch (error) {
    console.error("Delete meal log error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get daily nutrition summary
export const getDailyNutritionSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const mealLogs = await prisma.mealLog.findMany({
      where: {
        userId,
        mealDate: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { mealDate: 'asc' }
    });

    // Calculate totals
    const totals = mealLogs.reduce(
      (acc, meal) => ({
        calories: acc.calories + (meal.calories || 0),
        protein: acc.protein + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fat: acc.fat + (meal.fat || 0)
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    // Group by meal type
    const mealsByType = mealLogs.reduce((acc, meal) => {
      if (!meal.mealType) return acc;
      if (!acc[meal.mealType]) {
        acc[meal.mealType] = {
          meals: [],
          totals: { calories: 0, protein: 0, carbs: 0, fat: 0 }
        };
      }
      acc[meal.mealType].meals.push(meal);
      acc[meal.mealType].totals.calories += (meal.calories || 0);
      acc[meal.mealType].totals.protein += (meal.protein || 0);
      acc[meal.mealType].totals.carbs += (meal.carbs || 0);
      acc[meal.mealType].totals.fat += (meal.fat || 0);
      return acc;
    }, {});

    res.json({
      date,
      totals,
      mealsByType,
      totalMeals: mealLogs.length
    });
  } catch (error) {
    console.error("Get daily nutrition summary error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get nutrition statistics
export const getNutritionStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const [
      totalMeals,
      avgDailyStats,
      mealTypeDistribution,
      recentMeals
    ] = await Promise.all([
      // Total meal count
      prisma.mealLog.count({ 
        where: { 
          userId,
          mealDate: { gte: startDate }
        } 
      }),
      
      // Average daily nutrition
      prisma.mealLog.aggregate({
        where: { 
          userId,
          mealDate: { gte: startDate }
        },
        _avg: {
          calories: true,
          protein: true,
          carbs: true,
          fat: true
        }
      }),
      
      // Meals by type
      prisma.mealLog.groupBy({
        by: ['mealType'],
        where: { 
          userId,
          mealDate: { gte: startDate }
        },
        _count: { mealType: true }
      }),
      
      // Recent meals (last 5)
      prisma.mealLog.findMany({
        where: { userId },
        take: 5,
        orderBy: { mealDate: 'desc' },
        select: {
          id: true,
          foodItem: true,
          mealType: true,
          calories: true,
          mealDate: true
        }
      })
    ]);

    res.json({
      period: `${days} days`,
      totalMeals,
      averageDailyNutrition: {
        calories: avgDailyStats._avg.calories || 0,
        protein: avgDailyStats._avg.protein || 0,
        carbs: avgDailyStats._avg.carbs || 0,
        fat: avgDailyStats._avg.fat || 0
      },
      mealTypeDistribution: mealTypeDistribution.map(stat => ({
        mealType: stat.mealType,
        count: stat._count.mealType
      })),
      recentMeals
    });
  } catch (error) {
    console.error("Get nutrition stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Quick add meal (for predefined common meals)
export const quickAddMeal = async (req, res) => {
  try {
    const { presetId, mealType, mealDate } = req.body;
    const userId = req.user.id;

    // Predefined common meals
    const mealPresets = {
      coffee: { foodItem: "Black Coffee", servingSize: 1, unit: "cup", calories: 5, protein: 0.3, carbs: 1, fat: 0 },
      banana: { foodItem: "Banana", servingSize: 1, unit: "medium", calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
      rice: { foodItem: "White Rice", servingSize: 1, unit: "cup", calories: 205, protein: 4.3, carbs: 45, fat: 0.4 },
      milk: { foodItem: "Whole Milk", servingSize: 1, unit: "cup", calories: 150, protein: 8, carbs: 12, fat: 8 },
      egg: { foodItem: "Large Egg", servingSize: 1, unit: "piece", calories: 70, protein: 6, carbs: 0.6, fat: 5 },
      bread: { foodItem: "Whole Wheat Bread", servingSize: 1, unit: "slice", calories: 80, protein: 4, carbs: 14, fat: 1 },
      apple: { foodItem: "Apple", servingSize: 1, unit: "medium", calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
      chicken: { foodItem: "Grilled Chicken Breast", servingSize: 100, unit: "grams", calories: 165, protein: 31, carbs: 0, fat: 3.6 }
    };

    const preset = mealPresets[presetId];
    if (!preset) {
      return res.status(400).json({ message: "Invalid preset ID" });
    }

    const mealLog = await prisma.mealLog.create({
      data: {
        ...preset,
        mealType: mealType || 'SNACK',
        mealDate: mealDate ? new Date(mealDate) : new Date(),
        userId
      },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        }
      }
    });

    res.status(201).json({
      message: "Quick meal added successfully",
      mealLog
    });
  } catch (error) {
    console.error("Quick add meal error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get available quick meal presets
export const getQuickMealPresets = async (req, res) => {
  try {
    const presets = {
      coffee: { name: "Black Coffee", calories: 5, description: "1 cup black coffee" },
      banana: { name: "Banana", calories: 105, description: "1 medium banana" },
      rice: { name: "White Rice", calories: 205, description: "1 cup cooked rice" },
      milk: { name: "Whole Milk", calories: 150, description: "1 cup whole milk" },
      egg: { name: "Large Egg", calories: 70, description: "1 large egg" },
      bread: { name: "Whole Wheat Bread", calories: 80, description: "1 slice" },
      apple: { name: "Apple", calories: 95, description: "1 medium apple" },
      chicken: { name: "Grilled Chicken Breast", calories: 165, description: "100g grilled chicken" }
    };

    res.json({ presets });
  } catch (error) {
    console.error("Get quick meal presets error:", error);
    res.status(500).json({ message: "Server error" });
  }
};