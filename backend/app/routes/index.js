const express = require("express");
const UserController = require("../controllers/UserController");

const {authMiddleware} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/google-login", UserController.googleLogin);

router.get("/users", authMiddleware, UserController.index);
router.get("/users/:id", authMiddleware, UserController.show);
router.put("/users/:id", authMiddleware, UserController.update);
router.delete("/users/:id", authMiddleware, UserController.destroy);

module.exports = router;
