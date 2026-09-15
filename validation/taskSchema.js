const Joi = require("joi");

const taskSchema = Joi.object({
  title: Joi.string().trim().min(3).max(30).required(),
  isCompleted: Joi.boolean().default(false).not(null),
  priority: Joi.string()
    .trim()
    .valid("low", "medium", "high")
    .default("medium"),
});

const patchTaskSchema = Joi.object({
  title: Joi.string().trim().min(3).max(30).not(null),
  isCompleted: Joi.boolean().not(null),
  priority: Joi.string().trim().valid("low", "medium", "high"),
  trash: Joi.boolean().valid(false),
})
  .min(1)
  .message("No changes were specified.");

const taskArraySchema = Joi.object({
  taskIds: Joi.array()
    .items(Joi.number().integer())
    .min(1)
    .message("Must include atleast 1 task id."),
});

module.exports = { taskSchema, patchTaskSchema, taskArraySchema };
