const mongoose = require("mongoose");
const { TASK_MODEL_NAME, USER_MODEL_NAME } = require("../constants/models");

const taskSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: USER_MODEL_NAME,
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model(TASK_MODEL_NAME, taskSchema);

module.exports = {
  Task,
};
