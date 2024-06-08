const ToDoModel = require("../models/ToDoModel");

module.exports.getToDo = async (req, res) => {
  const toDo = await ToDoModel.find({ userId: req.query.userId });
  res.send(toDo);
};

module.exports.saveToDo = async (req, res) => {
  const { title, description, status, priority } = req.body;
  const userId = req.query.userId;
  console.log("userId", userId);

  ToDoModel.create({
    title,
    description,
    status,
    priority,
    userId,
  }).then((data) => {
    console.log("Added successfully");
    console.log(data);
    res.send(data);
  });
};

module.exports.updateToDo = async (req, res) => {
  const { _id, title, description, status, priority } = req.body;

  ToDoModel.findOneAndUpdate(
    { _id, userId: req.query.userId },
    { title, description, status, priority }
  )
    .then(() => res.send({ status }))
    .catch((err) => console.log(err));
};

module.exports.deleteToDo = async (req, res) => {
  console.log("====================================");
  console.log(req.body);
  console.log("====================================");

  const { _id } = req.body;

  ToDoModel.findOneAndDelete({ _id, userId: req.query.userId })
    .then(() => res.send("Deleted Successfully"))
    .catch((err) => console.log(err));
};
