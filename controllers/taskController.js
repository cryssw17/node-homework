const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");

const taskCounter = (() => {
  let lastTaskCount = 0;
  return () => {
    lastTaskCount += 1;
    return lastTaskCount;
  };
})();

function create(req, res) {
  if (!req.body) req.body = {};
  const { error, value } = taskSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  const newTask = {
    id: taskCounter(),
    title: value.title,
    isCompleted: value.isCompleted,
    userId: global.user_id.email,
  };

  global.tasks.push(newTask);

  //sanitize task before returning
  const { userId, ...sanitizedNewTask } = newTask;
  return res.status(201).json(sanitizedNewTask);
}

function index(req, res) {
  const userTasks = global.tasks.filter(
    (task) => task.userId === global.user_id.email,
  );

  if (userTasks.length === 0) {
    return res.status(404).json({
      message: "There are no tasks for this user.",
    });
  } else {
    const tasksArray = userTasks.map(
      ({ userId, ...sanitizedUserTasks }) => sanitizedUserTasks,
    );

    return res.status(200).json(tasksArray);
  }
}

function show(req, res) {
  const taskId = parseInt(req.params?.id);
  if (isNaN(taskId)) {
    return res.status(400).json({
      message: "The task ID passed is not valid.",
    });
  }
  const queriedTask = global.tasks.find(
    (task) => task.id === taskId && task.userId === global.user_id.email,
  );

  if (!queriedTask) {
    return res.status(404).json({
      message: "No task found.",
    });
  } else {
    const { userId, ...sanitizedQueriedTask } = queriedTask;

    return res.status(200).json(sanitizedQueriedTask);
  }
}

function update(req, res) {
  if (!req.body) req.body = {};
  const { error, value } = patchTaskSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  const taskId = parseInt(req.params?.id);

  const task = global.tasks.find(
    (task) => task.id === taskId && task.userId === global.user_id.email,
  );

  if (!task) {
    return res.status(404).json({
      message: "No task found.",
    });
  } else {
    const updatedTask = Object.assign(task, value);

    const { userId, ...sanitizedUpdatedTask } = updatedTask;

    return res.status(200).json(sanitizedUpdatedTask);
  }
}

function deleteTask(req, res) {
  const taskId = parseInt(req.params?.id);

  if (isNaN(taskId)) {
    return res.status(400).json({
      message: "Task ID is not valid.",
    });
  }

  function checkTask(task) {
    return task.id === taskId && task.userId === global.user_id.email;
  }

  const taskIndex = global.tasks.findIndex(checkTask);

  if (taskIndex === -1) {
    return res.status(404).json({
      message: "No task found.",
    });
  } else {
    const deletedTask = global.tasks[taskIndex];
    const { userId, ...sanitizedDeletedTask } = deletedTask;

    global.tasks.splice(taskIndex, 1);

    return res.status(200).json(sanitizedDeletedTask);
  }
}

module.exports = {
  create,
  index,
  show,
  update,
  deleteTask,
};
