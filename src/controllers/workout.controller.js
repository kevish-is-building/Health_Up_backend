import prisma from "../config/prisma.js";

// Create a new workout
export const createWorkout = async (req, res) => {
  try {
    const {
      title,
      bodyParts,
      difficulty,
      equipment,
      instructions,
      tutorialLink,
      duration,
      calories,
      sets,
      reps,
      restTime,
      notes
    } = req.body;

    const userId = req.user.id;

    const workout = await prisma.userWorkout.create({
      data: {
        title,
        bodyParts: bodyParts || [],
        difficulty,
        equipment: equipment || [],
        instructions: instructions || [],
        tutorialLink,
        duration,
        calories,
        sets,
        reps,
        restTime,
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
      message: "Workout created successfully",
      workout
    });
  } catch (error) {
    console.error("Create workout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all workouts for the authenticated user
export const getUserWorkouts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, difficulty, bodyPart } = req.query;

    const skip = (page - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build filter conditions
    const where = { userId };
    
    if (difficulty) {
      where.difficulty = difficulty;
    }
    
    if (bodyPart) {
      where.bodyParts = {
        has: bodyPart
      };
    }

    const [workouts, totalCount] = await Promise.all([
      prisma.userWorkout.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, username: true, email: true }
          }
        }
      }),
      prisma.userWorkout.count({ where })
    ]);

    res.json({
      workouts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / take),
        totalCount,
        hasNext: skip + take < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Get user workouts error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a specific workout by ID
export const getWorkoutById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const workout = await prisma.userWorkout.findFirst({
      where: {
        id,
        userId // Ensure user can only access their own workouts
      },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        }
      }
    });

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    res.json({ workout });
  } catch (error) {
    console.error("Get workout by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a workout
export const updateWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Check if workout exists and belongs to user
    const existingWorkout = await prisma.userWorkout.findFirst({
      where: { id, userId }
    });

    if (!existingWorkout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    // Remove undefined values from updateData
    const cleanedUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    const updatedWorkout = await prisma.userWorkout.update({
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
      message: "Workout updated successfully",
      workout: updatedWorkout
    });
  } catch (error) {
    console.error("Update workout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a workout
export const deleteWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if workout exists and belongs to user
    const existingWorkout = await prisma.userWorkout.findFirst({
      where: { id, userId }
    });

    if (!existingWorkout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    await prisma.userWorkout.delete({
      where: { id }
    });

    res.json({ message: "Workout deleted successfully" });
  } catch (error) {
    console.error("Delete workout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get workout statistics for the user
export const getWorkoutStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      totalWorkouts,
      difficultyStats,
      bodyPartStats,
      recentWorkouts
    ] = await Promise.all([
      // Total workout count
      prisma.userWorkout.count({ where: { userId } }),
      
      // Workouts by difficulty
      prisma.userWorkout.groupBy({
        by: ['difficulty'],
        where: { userId },
        _count: { difficulty: true }
      }),
      
      // Most used body parts (this is a simplified version)
      prisma.userWorkout.findMany({
        where: { userId },
        select: { bodyParts: true }
      }),
      
      // Recent workouts (last 5)
      prisma.userWorkout.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          difficulty: true,
          duration: true,
          createdAt: true
        }
      })
    ]);

    // Process body parts statistics
    const bodyPartCounts = {};
    bodyPartStats.forEach(workout => {
      workout.bodyParts.forEach(part => {
        bodyPartCounts[part] = (bodyPartCounts[part] || 0) + 1;
      });
    });

    const topBodyParts = Object.entries(bodyPartCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([bodyPart, count]) => ({ bodyPart, count }));

    res.json({
      totalWorkouts,
      difficultyBreakdown: difficultyStats.map(stat => ({
        difficulty: stat.difficulty,
        count: stat._count.difficulty
      })),
      topBodyParts,
      recentWorkouts
    });
  } catch (error) {
    console.error("Get workout stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Search workouts
export const searchWorkouts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query, difficulty, bodyPart, page = 1, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const skip = (page - 1) * parseInt(limit);
    const take = parseInt(limit);

    const whereConditions = {
      userId,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { notes: { contains: query, mode: 'insensitive' } }
      ]
    };

    if (difficulty) {
      whereConditions.difficulty = difficulty;
    }

    if (bodyPart) {
      whereConditions.bodyParts = { has: bodyPart };
    }

    const [workouts, totalCount] = await Promise.all([
      prisma.userWorkout.findMany({
        where: whereConditions,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.userWorkout.count({ where: whereConditions })
    ]);

    res.json({
      workouts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / take),
        totalCount,
        hasNext: skip + take < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Search workouts error:", error);
    res.status(500).json({ message: "Server error" });
  }
};