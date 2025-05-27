require("dotenv").config();

const mongoConfig = {
  MONGO_DB_URL: process.env.MONGO_DB_URL,
  PORT: process.env.PORT || 5000,
  MONGO_DB_NAME: process.env.DB_NAME || "Property-Listing-System"
};
export default mongoConfig ;
