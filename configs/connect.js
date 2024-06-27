const mongoose = require("mongoose");

async function connectToMongoDB() {
  console.log("Creating Connection");

  mongoose
    .connect(process.env.MONGO_DB_ADDRESS)
    .then(() => {
      console.log("Synced db.");
    })
    .catch((err) => {
      console.log("Failed to sync db: " + err.message);
    });
}
connectToMongoDB();

module.exports = {
  connectToMongoDB,
};
