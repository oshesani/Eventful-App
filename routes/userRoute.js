const express = require("express");
const { registerUser, loginUser } = require("../controllers/userController");
const router = express.Router();
const validateRequest = require("../middleware/validateRequest");
const {registerSchema, loginSchema} = require("../validators/userValidator")
const { registerLimiter, loginLimiter } = require("../middleware/rateLimiter")




router.post("/register", registerLimiter,validateRequest(registerSchema),registerUser);

router.post("/login",loginLimiter,validateRequest(loginSchema), loginUser);


module.exports = router;