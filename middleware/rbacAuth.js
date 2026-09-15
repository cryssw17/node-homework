function authorize(req, res, next) {
  if (req.user.role != "admin") {
    return res
      .status(401)
      .json({
        message:
          "Unauthorized: User does not have permission to view this resource.",
      });
  }
  next();
}

module.exports = authorize;
