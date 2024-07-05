const swaggerUi = require("swagger-ui-express");
const fs = require("fs").promises;
const path = require("path");

async function loadSwaggerDocument() {
  try {
    const swaggerFilePath = path.resolve(__dirname, "swagger.json");
    const swaggerData = await fs.readFile(swaggerFilePath, "utf8");
    return JSON.parse(swaggerData);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  swaggerUi,
  loadSwaggerDocument,
};
