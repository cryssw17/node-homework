const express = require("express");
const taskController = require("../controllers/taskController");
const jwtMiddleware = require("../middleware/jwtMiddleware");

const router = express.Router();

router.use(jwtMiddleware);

router.post("/", taskController.create);
router.get("/", taskController.index);
router.post("/bulk-create", taskController.bulkCreate);
router.delete("/bulk-delete", taskController.bulkDelete);
router.delete("/empty-trash", taskController.emptyTrash);
router.get("/:id", taskController.show);
router.patch("/:id", taskController.update);
router.delete("/:id", taskController.deleteTask);

module.exports = router;
