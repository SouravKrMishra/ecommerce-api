require("dotenv").config();
const express = require("express");
const app = express();
require("./configs/connect.js");
const userRouter = require("./routes/user.js");
const adminRouter = require("./routes/admin.js");
const email = require("./routes/email.js");
const forgotPasswordRouter = require("./routes/forgotPassword");
const {
  swaggerUi,
  loadSwaggerDocument,
} = require("./routes/swagger/swagger.js");

app.use(express.urlencoded({ extended: false })); //middleware for form data
app.use(express.json()); //middleware to handle JSON payloads
app.use("/admin", adminRouter);
app.use("/user", userRouter);
app.use("/email", email);
app.use("/forgotPassword", forgotPasswordRouter);

loadSwaggerDocument()
  .then((swaggerDocument) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  })
  .catch((error) => {
    console.error("Failed to load Swagger document:", error);
  });

app.listen(process.env.PORT, () =>
  console.log("Server Started At PORT", process.env.PORT || 8001)
);
