const expr=require("express")
const { createProfile, updateProfile, deleteProfile, getProfileById, getProfileByUserName, getMyProfile, searchUser, globalSearch } = require("../controllers/userProfileController")
const upload = require("../utils/upload");
const authMiddleware = require("../utils/authMiddleware");

const router=expr.Router()

router.post("/create-user-profile",authMiddleware,upload.single("image"),createProfile)
router.put("/update-user-profile",authMiddleware,upload.single("image"),updateProfile)
router.get("/get-user-profile-by-id/:userId",getProfileById)
router.get("/get-user-profile/me",(req, res, next) => {
  next();
}, authMiddleware, getMyProfile);
router.get("/get-user-profile-by-username/:userName",getProfileByUserName)
router.get("/search",globalSearch)
router.delete("/delete-user-profile/:id",deleteProfile)

module.exports=router;
