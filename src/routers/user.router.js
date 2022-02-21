const express = require("express");
const bcrypt = require("bcrypt");
const { User } = require("../models/user");
const { ERROR, SUCCESS } = require("../constants/statuses");
const { USER_MODEL_SCHEMA, PASSWORD_SCHEMA } = require("../constants/models");
const {
  isAllUpdateParamsAllowed,
  isAllRequiredParamsIncluded,
} = require("../helpers/validation");
const authMiddleware = require("../middlewares/auth");
const router = express.Router();

//User login
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateJwtToken();
    console.log("user", user.getPublicData());
    res.send({ user: await user.getPublicData(), token });
  } catch (err) {
    res.status(ERROR.BAD_REQUEST).send({ error: err.message });
  }
});

//User logout
router.post("/users/logout", authMiddleware, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(ERROR.SERVER_ERROR).send(err);
  }
});

//User logout from all the devices
router.post("/users/logoutAll", authMiddleware, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(ERROR.SERVER_ERROR).send(err);
  }
});

//Create user
router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    const token = await user.generateJwtToken();
    const createdUser = await user.save();
    res
      .status(SUCCESS.CREATED)
      .send({ user: await createdUser.getPublicData(), token });
  } catch (err) {
    res.status(ERROR.BAD_REQUEST).send(err);
  }
});

//Get Users profile
router.get("/users/me", authMiddleware, async (req, res) => {
  res.send(await req.user.getPublicData());
});

//Update User
router.patch("/users/me", authMiddleware, async (req, res) => {
  const updatedParams = Object.keys(req.body);
  const allowedParams = [
    USER_MODEL_SCHEMA.name,
    USER_MODEL_SCHEMA.age,
    USER_MODEL_SCHEMA.email,
  ];

  if (!isAllUpdateParamsAllowed(updatedParams, allowedParams)) {
    return res
      .status(ERROR.BAD_REQUEST)
      .send({ error: "Invalid update params" });
  }

  try {
    const user = req.user;

    updatedParams.forEach((updatedParam) => {
      user[updatedParam] = req.body[updatedParam];
    });

    const newUser = await user.save();

    res.send(await newUser.getPublicData());
  } catch (err) {
    res.status(ERROR.BAD_REQUEST).send(err);
  }
});

//Change user password
router.put("/users/:id/password", async (req, res) => {
  const id = req.params.id;
  const updatedParams = Object.keys(req.body);
  const allowedParams = [
    PASSWORD_SCHEMA.oldPassword,
    PASSWORD_SCHEMA.newPassword,
  ];

  if (
    !isAllUpdateParamsAllowed(updatedParams, allowedParams) ||
    !isAllRequiredParamsIncluded(updatedParams, allowedParams)
  ) {
    return res
      .status(ERROR.BAD_REQUEST)
      .send({ error: "Invalid request params" });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(ERROR.NOT_FOUND).send({ error: "User not found" });
    }

    const isPasswordsMatched = await bcrypt.compare(
      req.body.oldPassword,
      user.password
    );
    if (!isPasswordsMatched) {
      return res.status(ERROR.FORBIDDEN).send({ error: "Incorrect password" });
    }

    user.password = req.body.newPassword;
    const newUser = await user.save();
    res.send(newUser);
  } catch (err) {
    res.status(ERROR.SERVER_ERROR).send(err);
  }
});

//Delete User
router.delete("/users/me", authMiddleware, async (req, res) => {
  try {
    const deletedUser = await req.user.getPublicData();
    await req.user.remove();
    res.send(deletedUser);
  } catch (err) {
    res.status(ERROR.SERVER_ERROR).send(err);
  }
});

module.exports = router;
