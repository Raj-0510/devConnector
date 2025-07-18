const userProfile = require("../models/userProfile");

// GET /api/userProfiles
exports.getAllUserProfiles = async (req, res) => {
  try {
    const currentUserProfile = await userProfile.findOne({
      userId: req.user.id,
    });

    const excludedUserIds = [
      req.user.id,
      ...currentUserProfile?.following?.map((id) => id?.toString()),
    ];
    const profiles = await userProfile.find(
      { userId: { $nin: excludedUserIds } },
      "userId userName skills image"
    );

    res.json(profiles);
  } catch (err) {
    console.error("err>", err);
    res.status(500).json({ error: "Failed to fetch user profiles." });
  }
};

// POST /api/userProfiles/:id/follow
exports.followUnfollow = async (req, res) => {
  const targetUserId = req.params.targetUserid;
  const currentUserId = req.user.id;

  try {
    const currentUserProfile = await userProfile.findOne({
      userId: currentUserId,
    });
    const targetUserProfile = await userProfile.findOne({
      userId: targetUserId,
    });

    if (!currentUserProfile || !targetUserProfile) {
      return res.status(404).json({ error: "User profile not found.",success: false });
    }

    const isFollowing = currentUserProfile.following.includes(
      targetUserProfile.userId
    );
    if (isFollowing) {
      currentUserProfile.following.pull(targetUserProfile.userId);
      targetUserProfile.followers.pull(currentUserProfile.userId);
    } else {
      currentUserProfile.following.push(targetUserProfile.userId);
      targetUserProfile.followers.push(currentUserProfile.userId);
    }

    await currentUserProfile.save();
    await targetUserProfile.save();
   
    res.status(200).json({ success: true, following: !isFollowing});
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to update follow status.",success: false });
  }
};

exports.connections = async (req, res) => {
  try {

    const userDetails = await userProfile
      .findOne({ userId: req.user.id })
      .populate({
        path: "followers",
        model: "userProfile",
        localField: "followers",
        foreignField: "userId",
        select: "userName skills bio image",
      })
      .populate({
        path: "following",
        model: "userProfile",
        localField: "following",
        foreignField: "userId",
        select: "userName skills bio image",
      });

    if (!userDetails) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      followers: userDetails.followers,
      following: userDetails.following,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch connections" });
  }
};
