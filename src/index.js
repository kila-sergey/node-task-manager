const express = require("express");
const taskRouter = require("./routers/task.router");
const userRouter = require("./routers/user.router");

require("dotenv").config();
require("./db/mongoose");

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
