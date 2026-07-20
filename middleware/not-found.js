function notFound(req, res) {
  return res.status(404).json({
    message: `Route for ${req.method} ${req.path} not found.`,
  });
}

module.exports = notFound;
