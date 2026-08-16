function errorHandler(err, req, res, next) {
  if (err.name === "PrismaClientInitializationError") {
    console.error("Couldn't connect to the database. Is it running?");
  }
  console.error(err);
  return res.status(500).json({
    message: "Internal server error",
  });
}

module.exports = errorHandler;
