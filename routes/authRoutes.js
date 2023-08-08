const router = require("express").Router()
const authController = require("../controllers/authController")
router.post("/register", authController.registerUser)
router.post("/login", authController.loginUser)
router.get("/generateAccessToken", authController.generateAccessToken)
router.get("/logout", authController.logout)
module.exports = router
