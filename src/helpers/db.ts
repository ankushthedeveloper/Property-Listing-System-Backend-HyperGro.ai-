import mongoose from "mongoose";

import mongoConfig from "@config/mongo.config";

function connect(): void {
  const mongoUrl = mongoConfig.MONGO_DB_URL;

  if (!mongoUrl) {
    throw new Error("MONGO_DB_URL is not defined in the config");
  }

  mongoose.connect(mongoUrl, {
    dbName: process.env.DB_NAME,
  } as mongoose.ConnectOptions);

  mongoose.Promise = global.Promise;

  // Database connection events
  mongoose.connection.on("connected", () => {
    console.log(`Mongoose default connection open for worker ${process.pid}`);
  });

  mongoose.connection.on("error", (err: Error) => {
    console.error(`Mongoose default connection error: ${err.message}`);
  });

  mongoose.connection.on("disconnected", () => {
    console.log(
      `Mongoose default connection disconnected for worker ${process.pid}`
    );
  });

  // Handle process termination and close the connection
  process.on("SIGINT", async () => {
    try {
      await mongoose.connection.close();
      console.log(
        "Mongoose default connection disconnected through app termination"
      );
    } catch (error) {
      console.error("Error closing Mongoose connection:", error);
    } finally {
      process.exit(0); // Gracefully exit the app
    }
  });
}

export default connect;
