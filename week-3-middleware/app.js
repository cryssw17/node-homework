const express = require("express");
const dogsRouter = require("./routes/dogs");
const { randomUUID } = require("crypto");

const app = express();

// Assignment 3b and 3c ask you to add middleware in this file.

//request id
app.use((req, res, next) => {
  req.requestId = randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
});

//logger
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}]: ${req.method} ${req.path} (${req.requestId})`);
  next();
});

//security headers

//json parsing
app.use(express.json());

//static file
app.use(express.static("week-3-middleware/public"));

//content-type validation

//routes
app.use("/", dogsRouter); // Do not remove this line

//not found(404)
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    requestId: req.requestId,
  });
});

//error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: "Internal Server Error",
    requestId: req.requestId,
  });
});

if (require.main === module) {
  app.listen(3000, () => {
    console.log("Dog rescue app is listening on port 3000...");
  });
}

module.exports = app;
