const taskCounter = (() => {
  let lastTaskCount = 0;
  return () => {
    lastTaskCount += 1;
    return lastTaskCount;
  };
})();

function create(req, res) {
  const newTask = {
    id: taskCounter(),
    title: 
    isCompleted: 
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

  if (userTasks) {
    const { userId, ...sanitizedUserTasks } = userTasks;
    return res.status(200).json({
      message: sanitizedUserTasks,
    });
  } else {
    return res.status(400).json({
      message: "There are no tasks for this user.",
    });
  }
}

function show(req, res) {
  const taskId = parseInt(req.params?.id);
  if (!taskId) {
    return res.status(400).json({
      message: "The task Id passed is not valid.",
    });
  } else {
    const queriedTask = global.user.tasks.find(
      (task) => task.id === taskId && task.userId === global.user_id.email,
    );

    const { userId, ...sanitizedQueriedTask } = queriedTask;

    return res.status(200).json({
      message: sanitizedQueriedTask,
    });
  }
}

function update(req, res) {
//validate patch body -> check that contains title, is completed

  const taskId = parseInt(req.params?.id);
  
}

function deleteTask(req, res) {

}

module.exports = {
  create,
  index,
  show,
  update,
  deleteTask,
};
