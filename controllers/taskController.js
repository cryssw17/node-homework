const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");
const prisma = require("../db/prisma");

async function create(req, res) {
  if (!req.body) req.body = {};
  const { error, value } = taskSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  const task = await prisma.task.create({
    data: {
      title: value.title,
      isCompleted: value.isCompleted,
      userId: global.user_id,
    },
    select: { id: true, title: true, isCompleted: true },
  });

  //sanitize task before returning

  const { userId, ...sanitizedNewTask } = task;
  return res.status(201).json(sanitizedNewTask);
}

async function index(req, res) {
  const tasks = await prisma.task.findMany({
    where: {
      userId: global.user_id,
    },
    select: { title: true, isCompleted: true, id: true },
  });

  if (tasks.length === 0) {
    return res.status(404).json({
      message: "There are no tasks for this user.",
    });
  } else {
    const tasksArray = tasks.map(
      ({ userId, ...sanitizedUserTasks }) => sanitizedUserTasks,
    );

    return res.status(200).json(tasksArray);
  }
}

async function show(req, res, next) {
  const taskId = parseInt(req.params?.id);
  if (isNaN(taskId)) {
    return res.status(400).json({
      message: "The task ID passed is not valid.",
    });
  }

  try {
    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
        userId: global.user_id,
      },
      select: { title: true, isCompleted: true, id: true },
    });
    if (task === null) {
      return res.status(404).json({
        message: "The task was not found.",
      });
    }
    return res.status(200).json(task);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "The task was not found." });
    } else {
      return next(err);
    }
  }
}

async function update(req, res, next) {
  if (!req.body) req.body = {};
  const { error, value } = patchTaskSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  const id = parseInt(req.params?.id);
  if (isNaN(id)) {
    return res.status(400).json({
      message: "Task ID is not valid.",
    });
  }

  try {
    const task = await prisma.task.update({
      data: value,
      where: {
        id,
        userId: global.user_id,
      },
      select: { title: true, isCompleted: true, id: true },
    });

    return res.status(200).json(task);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "The task was not found." });
    } else {
      return next(err);
    }
  }
}

async function deleteTask(req, res, next) {
  const taskId = parseInt(req.params?.id);

  if (isNaN(taskId)) {
    return res.status(400).json({
      message: "Task ID is not valid.",
    });
  }

  try {
    const task = await prisma.task.delete({
      where: {
        id: taskId,
        userId: global.user_id,
      },
      select: { id: true, title: true },
    });
    return res.status(200).json(task);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "No task found." });
    } else {
      return next(err);
    }
  }
}

module.exports = {
  create,
  index,
  show,
  update,
  deleteTask,
};
