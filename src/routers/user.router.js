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

router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateJwtToken();
    const userPublicData = await user.getPublicData();
    res.send({ user: userPublicData, token });
  } catch (err) {
    res.status(ERROR.BAD_REQUEST).send({ error: err.message });
  }
});

router.post("/logout", authMiddleware, async (req, res) => {
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

router.post("/logoutAll", authMiddleware, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(ERROR.SERVER_ERROR).send(err);
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  const userPublicData = await req.user.getPublicData();
  res.send(userPublicData);
});

router.patch("/me", authMiddleware, async (req, res) => {
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
    const newUserPublicData = await newUser.getPublicData();

    res.send(newUserPublicData);
  } catch (err) {
    res.status(ERROR.BAD_REQUEST).send(err);
  }
});

router.delete("/me", authMiddleware, async (req, res) => {
  try {
    const deletedUser = await req.user.getPublicData();
    await req.user.remove();
    res.send(deletedUser);
  } catch (err) {
    res.status(ERROR.SERVER_ERROR).send(err);
  }
});

router.post("/users", authMiddleware, async (req, res) => {
  const user = new User(req.body);
  try {
    const token = await user.generateJwtToken();
    const createdUser = await user.save();
    const createdUserPublicData = await createdUser.getPublicData();

    res.status(SUCCESS.CREATED).send({ user: createdUserPublicData, token });
  } catch (err) {
    res.status(ERROR.BAD_REQUEST).send(err);
  }
});

router.put("/password", authMiddleware, async (req, res) => {
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
    const user = req.user;

    const isPasswordsMatched = await bcrypt.compare(
      req.body.oldPassword,
      user.password
    );

    if (!isPasswordsMatched) {
      return res.status(ERROR.FORBIDDEN).send({ error: "Incorrect password" });
    }

    user.password = req.body.newPassword;
    const newUser = await user.save();
    const newUserPublicData = await newUser.getPublicData();

    res.send(newUserPublicData);
  } catch (err) {
    res.status(ERROR.SERVER_ERROR).send(err);
  }
});

module.exports = router;
