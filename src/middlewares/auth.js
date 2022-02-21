const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
const { JWT_SECRET_PHRASE } = require("../constants/models");
const { ERROR } = require("../constants/statuses");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, JWT_SECRET_PHRASE);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });
    if (!user) {
      throw new Error();
    }
    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    res.status(ERROR.AUTH_ERROR).send({ error: "Authorization error" });
  }
};

module.exports = authMiddleware;
