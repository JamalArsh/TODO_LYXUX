const { Router } = require("express");
const { register, login } = require("../controllers/UserController");

const router = Router();

router.post("/register", register);
router.post("/login", login);

module.exports = router;
