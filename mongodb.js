const { MongoClient } = require("mongodb");

const connectionUrl = "mongodb://127.0.0.1:27017";

MongoClient.connect(
  connectionUrl,
  { useNewUrlParser: true },
  (error, client) => {
    if (error) {
      return console.log("Error connect to the database", error);
    }
  }
);
