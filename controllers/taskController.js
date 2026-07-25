const { taskSchema, patchSchema } = require("../validation/taskSchema");

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
  return res.status(201).json({
    message: sanitizedNewTask,
  });
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

    return res.status(200).json({
      message: tasksArray,
    });
  }
}

function show(req, res) {
  const taskId = parseInt(req.params?.id);
  console.log(taskId);
  if (!taskId) {
    return res.status(400).json({
      message: "The task Id passed is not valid.",
    });
  }
  const queriedTask = global.tasks.find(
    (task) => task.id === taskId && task.userId === global.user_id.email,
  );

  console.log(queriedTask);
  if (queriedTask === undefined) {
    return res.status(404).json({
      message: "No task found.",
    });
  } else {
    const { userId, ...sanitizedQueriedTask } = queriedTask;

    return res.status(200).json({
      message: sanitizedQueriedTask,
    });
  }
}

function update(req, res) {
  if (!req.body) req.body = {};
  const { error, value } = patchSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  const taskId = parseInt(req.params?.id);

  const task = global.tasks.find(
    (task) => task.id === taskId && task.email === global.user_id,
  );

  if (!task) {
    return res.status(404).json({
      message: "No task found.",
    });
  } else {
    const updatedTask = Object.assign(task, value);

    const { userId, ...sanitizedUpdatedTask } = updatedTask;

    return res.status(200).json({
      message: sanitizedUpdatedTask,
    });
  }
}

function deleteTask(req, res) {
  const taskId = parseInt(req.params?.id);

  if (!taskId) {
    return res.status(400).json({
      message: "Task ID is not valid.",
    });
  }

  const taskIndex = global.tasks.findIndex(taskId && global.user_id.email);

  if (taskIndex === -1) {
    return res.status(404).json({
      message: "No task found.",
    });
  } else {
    const deletedTask = global.tasks[taskIndex];
    const { userId, ...sanitizedDeletedTask } = deletedTask;

    global.tasks.splice(taskIndex, 1);

    return res.status(200).json({
      message: sanitizedDeletedTask,
    });
  }
}

module.exports = {
  create,
  index,
  show,
  update,
  deleteTask,
};
