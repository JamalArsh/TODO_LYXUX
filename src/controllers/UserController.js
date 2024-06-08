const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");

const secret = "your_jwt_secret"; // Use a more secure secret in production

module.exports.register = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = new UserModel({ username, password });
    await user.save();
    res.status(201).send("User registered successfully");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(401).send({ message: "Invalid username or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).send({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ userId: user._id, username }, secret, {
      expiresIn: "1h",
    });
    res.send({ token });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports.authenticate = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).send("Access denied. No token provided.");
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.userId;
    next();
  } catch (ex) {
    res.status(400).send("Invalid token.");
  }
};
