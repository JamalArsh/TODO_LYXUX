const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    default: "to-do",
  },
  priority: {
    type: String,
    default: "low",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ToDo", todoSchema);
