const mongoose = require("mongoose");
const { CONNECTION_URL } = require("../constants/db");

mongoose.connect(CONNECTION_URL, {
  autoIndex: true,
});
