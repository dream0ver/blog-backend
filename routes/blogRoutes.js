const router = require("express").Router()
const blogController = require("../controllers/blogController")
const verifyAccessToken = require("../middleware/verifyAccessToken")
router.post("/createPost", verifyAccessToken, blogController.createPost)
router.put("/editPost", verifyAccessToken, blogController.editPost)
router.delete("/deletePost/:id", verifyAccessToken, blogController.deletePost)
router.get("/posts", blogController.getPostsByCategory)
router.get("/post/:id", blogController.getPostById)
module.exports = router
