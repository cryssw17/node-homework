const prisma = require("../db/prisma");

async function getUserAnalytics(req, res) {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json({ message: "The userId is not valid." });
  }

  const validUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!validUser) {
    return res.status(404).json({ message: "This user does not exist." });
  }

  const taskStats = await prisma.task.groupBy({
    by: ["isCompleted"],
    where: { userId },
    _count: { id: true },
  });

  const recentTasks = await prisma.task.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      isCompleted: true,
      priority: true,
      createdAt: true,
      User: {
        select: {
          name: true,
        },
      },
    },
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const weeklyTasks = await prisma.task.groupBy({
    by: ["createdAt"],
    where: {
      userId,
      createdAt: {
        gte: oneWeekAgo,
      },
    },
  });

  return res.status(200).json({
    taskStats,
    recentTasks,
    weeklyTasks,
  });
}

async function getUsersWithStats(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!page >= 1 || 1 <= limit <= 100) {
    return res
      .status(400)
      .json({
        message:
          "The page can not be less than 1. The limit must be between 1 and 100.",
      });
  }

  const usersRaw = await prisma.user.findMany({
    include: {
      Task: {
        where: { isCompleted: false },
        select: { id: true },
        take: 5,
      },
      _count: {
        select: {
          Task: true,
        },
      },
    },
    skip: skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const users = usersRaw.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    _count: user._count,
    Task: user.Task,
  }));

  const totalUsers = await prisma.user.count();

  const pagination = {
    page,
    limit,
    total: totalUsers,
    pages: Math.ceil(totalUsers / limit),
    hasNext: page * limit < totalUsers,
    hasPrev: page > 0,
  };

  return res.status(200).json({ users, pagination });
}

async function taskSearch(req, res) {
  const searchQuery = req.query.q;

  if (!searchQuery || searchQuery.trim().length < 2) {
    return res.status(400).json({
      error: "Search query must be at least 2 characters long",
    });
  }

  const limit = parseInt(req.query.limit) || 20;

  const searchPattern = `%${searchQuery}%`;
  const exactMatch = searchQuery;
  const startsWith = `${searchQuery}%`;

  const searchResults = await prisma.$queryRaw`
    SELECT
        t.id,
        t.title,
        t.is_completed as "isCompleted",
        t.priority,
        t.created_at as "createdAt",
        t.user_id as "userId",
        u.name as "user_name"
    FROM tasks t
    JOIN users u ON t.user_id = u.id
    WHERE t.title ILIKE ${searchPattern}
        OR u.name ILIKE ${searchPattern}
    ORDER BY
        CASE
            WHEN t.title ILIKE ${exactMatch} THEN 1
            WHEN t.title ILIKE ${startsWith} THEN 2
            WHEN t.title ILIKE ${searchPattern} THEN 3
            ELSE 4
        END, 
        t.created_at DESC
    LIMIT ${parseInt(limit)}
    `;

  return res.status(200).json({
    results: searchResults,
    query: searchQuery,
    count: searchResults.length,
  });
}

module.exports = { getUserAnalytics, getUsersWithStats, taskSearch };
