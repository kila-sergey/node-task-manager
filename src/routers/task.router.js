const express = require("express");
const { Task } = require("../models/task");
const { ERROR, SUCCESS } = require("../constants/statuses");
const {
  TASK_MODEL_SCHEMA,
  DEFAULT_PAGINATION_LIMIT,
  SORT_ORDER,
} = require("../constants/models");
const { isAllUpdateParamsAllowed } = require("../helpers/validation");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

//Create task
router.post("/tasks", authMiddleware, async (req, res) => {
  const task = new Task({ ...req.body, createdBy: req.user._id });

  try {
    const createdTask = await task.save();
    res.status(SUCCESS.CREATED).send(createdTask);
  } catch (err) {
    res.status(ERROR.BAD_REQUEST).send(err);
  }
});

//Get all tasks
//get /tasks?isCompleted=true
//get /tasks?limit=10&skip=2
//get /tasks?sortBy=createdAt:desc
router.get("/tasks", authMiddleware, async (req, res) => {
  const user = req.user;
  //Filter params
  const filters = {};
  //Pagination params
  const limit = parseInt(req.query.limit) || DEFAULT_PAGINATION_LIMIT;
  const skip = parseInt(req.query.skip) || 0;
  //Sort params
  const sort = {};

  if (req.query.isCompleted) {
    filters.isCompleted = req.query.isCompleted === "true";
  }

  if (req.query.sortBy) {
    const parsedSort = req.query.sortBy.split(":");
    sort[parsedSort[0]] = parsedSort[1] === SORT_ORDER.DESC ? -1 : 1;
  }

  try {
    const populatedUser = await user.populate({
      path: "tasks",
      match: filters,
      options: {
        limit: limit,
        skip: skip,
        sort,
      },
    });
    const tasksList = populatedUser.tasks;
    res.send({
      data: tasksList,
      metaInfo: {
        limit: limit,
        skip: skip,
      },
    });
  } catch (err) {
    res.status(ERROR.SERVER_ERROR).send(err);
  }
});

//Get task
router.get("/tasks/:id", authMiddleware, async (req, res) => {
  const taskId = req.params.id;
  const userId = req.user._id;
  try {
    const searchedTask = await Task.findOne({ _id: taskId, createdBy: userId });
    if (!searchedTask) {
      return res.status(ERROR.NOT_FOUND).send();
    }
    res.send(searchedTask);
  } catch (err) {
    res.status(ERROR.SERVER_ERROR).send(err);
  }
});

//Update task
router.patch("/tasks/:id", authMiddleware, async (req, res) => {
  const taskId = req.params.id;
  const userId = req.user._id;
  const updatedParams = Object.keys(req.body);
  const allowedParams = [
    TASK_MODEL_SCHEMA.description,
    TASK_MODEL_SCHEMA.isCompleted,
  ];

  if (!isAllUpdateParamsAllowed(updatedParams, allowedParams)) {
    return res
      .status(ERROR.BAD_REQUEST)
      .send({ error: "Invalid update params" });
  }

  try {
    const task = await Task.findOne({ _id: taskId, createdBy: userId });

    if (!task) {
      return res
        .status(ERROR.NOT_FOUND)
        .send({ error: "Task with this id not found" });
    }

    updatedParams.forEach((updatedParam) => {
      task[updatedParam] = req.body[updatedParam];
    });
    const newTask = await task.save();
    res.send(newTask);
  } catch (err) {
    res.status(ERROR.BAD_REQUEST).send(err);
  }
});

//Delete task
router.delete("/tasks/:id", authMiddleware, async (req, res) => {
  const taskId = req.params.id;
  const userId = req.user._id;
  try {
    const deletedTask = await Task.findOneAndDelete({
      _id: taskId,
      createdBy: userId,
    });
    if (!deletedTask) {
      return res.status(ERROR.NOT_FOUND).send({ error: "Task not found" });
    }
    res.send(deletedTask);
  } catch (err) {
    res.status(ERROR.SERVER_ERROR).send(err);
  }
});

module.exports = router;
