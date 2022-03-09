const USER_MODEL_NAME = "User";
const TASK_MODEL_NAME = "Task";

const USER_MODEL_SCHEMA = {
  name: "name",
  age: "age",
  password: "password",
  email: "email",
};

const PASSWORD_SCHEMA = {
  oldPassword: "oldPassword",
  newPassword: "newPassword",
};

const TASK_MODEL_SCHEMA = {
  description: "description",
  isCompleted: "isCompleted",
};

const PASSWORD_HASH_SALT_ROUNDS = 8;

const DEFAULT_PAGINATION_LIMIT = 20;

const SORT_ORDER = {
  ASC: "acs",
  DESC: "desc",
};

module.exports = {
  USER_MODEL_NAME,
  TASK_MODEL_NAME,
  USER_MODEL_SCHEMA,
  TASK_MODEL_SCHEMA,
  PASSWORD_SCHEMA,
  PASSWORD_HASH_SALT_ROUNDS,
  DEFAULT_PAGINATION_LIMIT,
  SORT_ORDER,
};
