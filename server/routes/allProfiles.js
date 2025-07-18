const express=require("express");
const { getAllUserProfiles, followUnfollow, connections } = require("../controllers/allProfilesController");
const authMiddleware = require("../utils/authMiddleware");

const router=express.Router()


router.get("/",authMiddleware,getAllUserProfiles)
router.get("/:targetUserid/follow",authMiddleware,followUnfollow)
router.get("/connections",authMiddleware,connections)

module.exports=router;