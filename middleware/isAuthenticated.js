const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  const token = req.headers.authorization.replace("Bearer ", "");

  if (req.headers.authorization) {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.json({ message: "Unauthorized" });
    } else {
      req.user = user;
      return next();
    }
  } else {
    return res.json({ message: "Unauthorized" });
  }
};

module.exports = isAuthenticated;
