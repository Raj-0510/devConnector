const express=require("express");
const { createPost, toggleLike, getAllPosts, getUserPosts, deletePost, addComment } = require("../controllers/FeedController");
const upload = require("../utils/upload");
const authMiddleware = require("../utils/authMiddleware");

const router=express.Router()

router.post("/create-post",authMiddleware,upload.single("image"),createPost)
router.post("/toggle-like/:id",authMiddleware,toggleLike)
router.get("/get-all-posts",authMiddleware,getAllPosts)
router.post("/add-comment/:postId",authMiddleware,addComment)
router.get("/get-user-posts/:userId",getUserPosts)
router.delete("/delete-post/:id",authMiddleware,deletePost)

module.exports=router;