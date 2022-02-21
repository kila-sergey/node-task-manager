const { MongoClient, ObjectId } = require("mongodb");

const connectionUrl = "mongodb://127.0.0.1:27017";
const databaseName = "task-manager";

const USERS_COLLECTION = "users";
const TASKS_COLLECTION = "tasks";

MongoClient.connect(
  connectionUrl,
  { useNewUrlParser: true },
  (error, client) => {
    if (error) {
      return console.log("Error connect to the database", error);
    }
    const db = client.db(databaseName);

    db.collection(TASKS_COLLECTION)
      .deleteOne({
        _id: new ObjectId("61ebffa7bb9cbf69bed0cee9"),
      })
      .then((result) => console.log("result", result));
  }
);
