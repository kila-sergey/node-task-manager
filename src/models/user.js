const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const {
  USER_MODEL_NAME,
  TASK_MODEL_NAME,
  USER_MODEL_SCHEMA,
  PASSWORD_HASH_SALT_ROUNDS,
  JWT_SECRET_PHRASE,
} = require("../constants/models");
const { Task } = require("./task");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      validate(value) {
        if (value < 0) {
          throw new Error("Age should be positive");
        }
      },
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Enter valid email");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      trim: true,
      validate(value) {
        const forbiddenPassPhrase = "password";
        if (value.toLowerCase().includes(forbiddenPassPhrase)) {
          throw new Error("Password shouldn't contain 'password' phrase");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.virtual("tasks", {
  ref: TASK_MODEL_NAME,
  localField: "_id",
  foreignField: "createdBy",
});

userSchema.methods.getPublicData = async function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  return userObject;
};

userSchema.methods.generateJwtToken = async function () {
  const token = jwt.sign({ _id: this.id.toString() }, JWT_SECRET_PHRASE, {
    expiresIn: "7 days",
  });

  this.tokens = [...this.tokens, { token }];

  await this.save();

  return token;
};

userSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) {
    throw new Error("User with this email not found");
  }
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new Error("Incorrect password");
  }
  return user;
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified(USER_MODEL_SCHEMA.password)) {
    user.password = await bcrypt.hash(user.password, PASSWORD_HASH_SALT_ROUNDS);
  }
});

userSchema.pre("remove", async function (next) {
  const user = this;
  await Task.deleteMany({ createdBy: user._id });
});

const User = mongoose.model(USER_MODEL_NAME, userSchema);

module.exports = {
  User,
};
