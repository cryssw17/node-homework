const express = require("express");
const analyticsController = require("../controllers/analyticsController");
const jwtMiddleware = require("../middleware/jwtMiddleware");
const rbacAuth = require("../middleware/rbacAuth");

const router = express.Router();

router.use(jwtMiddleware, rbacAuth);

router.get("/users/:id", analyticsController.getUserAnalytics);
router.get("/users", analyticsController.getUsersWithStats);
router.get("/tasks/search", analyticsController.searchTasks);

module.exports = router;
