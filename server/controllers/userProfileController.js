const comment = require("../models/comment");
const feedModel = require("../models/feedModel");
const feed = require("../models/feedModel");
const User = require("../models/user");
const userProfile = require("../models/userProfile");

exports.createProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userName, bio, skills, githubLink, linkedInLink, experience } =
      req.body;
    if (!userName || !bio || !skills || !githubLink || !linkedInLink)
      return res.status(400).json({ msg: "All fields are required" });
    const existingUser = await userProfile.findOne({ userName });

    if (existingUser) {
      return res
        .status(400)
        .json({ msg: "User with this username already exists" });
    }

    if (!req.file) {
      return res.status(400).json({ msg: "Image is required" });
    }
    const imagePath = req.file.path;

    const newProfile = new userProfile({
      userName,
      bio,
      skills,
      experience,
      githubLink,
      linkedInLink,
      image: imagePath,
      userId,
    });

    const response = await newProfile.save();
    return res.status(200).json({
      msg: "Saved Successfully",
      data: {
        userName,
        bio,
        skills,
        experience,
        githubLink,
        linkedInLink,
        image: imagePath,
      },
    });
  } catch (err) {
    console.error("err>>", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      userName,
      bio,
      skills,
      githubLink,
      linkedInLink,
      image,
      experience,
    } = req.body;
    if (!userName || !bio || !skills || !githubLink || !linkedInLink)
      return res.status(400).json({ msg: "All fields are required" });
    const updatedData = await userProfile.findOneAndUpdate(
      { userId: userId },
      { userName, bio, skills, githubLink, linkedInLink, image, experience },
      { new: true }
    );

    if (!updatedData) {
      return res.status(404).json({ msg: "Profile not found" });
    }

    return res.status(200).json({
      msg: "Updated Successfully",
      data: updatedData,
    });
  } catch (err) {
    console.error("err>>", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

exports.getProfileById = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ msg: "userId is required" });
    }
    const data = await userProfile.findOne({ userId });
    if (!data) {
      return res.status(404).json({ msg: "Profile not found" });
    }
    return res.status(200).json({
      msg: "Fetched Successfully",
      data: data,
    });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await userProfile.findOne({ userId });
    if (!profile) return res.status(404).json({ msg: "Profile not found" });

    res.json({ msg: "Fetched successfully", data: profile });
  } catch (err) {
    console.error("err>", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getProfileByUserName = async (req, res) => {
  try {
    const { userName } = req.params;
    if (!userName) {
      return res.status(400).json({ msg: "user name is required" });
    }
    const data = await userProfile.find({ userName: userName });
    if (!data?.length) {
      return res.status(404).json({ msg: "Profile not found" });
    }
    return res.status(200).json({
      msg: "Fetched Successfully",
      data: data,
    });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
};

exports.globalSearch = async (req, res) => {
  const {
    type,   
    q = "", 
    page = 1,
    limit = 10,
    skill,
  } = req.query;

  const skip = (page - 1) * limit;
  const query = {};
  try {
    let results;

    if (!type) {
      return res.status(400).json({ error: "Search type is required" });
    }

    switch (type) {
      case "user":
        if (q) query.$text = { $search: q };
        if (skill) query.skills = { $in: [skill] };

        results = await userProfile.find(query, { score: { $meta: "textScore" } })
          .sort({ score: { $meta: "textScore" } })
          .skip(skip)
          .limit(Number(limit));
        break;

      case "post":
        if (q) query.$text = { $search: q };
        results = await feed.find(query, { score: { $meta: "textScore" } })
          .sort({ score: { $meta: "textScore" } })
          .skip(skip)
          .limit(Number(limit));
        break;

      default:
        return res.status(400).json({ error: "Invalid type specified" });
    }
    res.json({ results });
  } catch (err) {
    console.error("err>>",err)
    res.status(500).json({ error: "Search failed", message: err.message });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ msg: "ID is required" });
    }
    const data = await userProfile.findOneAndDelete({ userId: id });
    if (!data) {
      return res.status(404).json({ msg: "Profile not found" });
    }
    await Promise.all([
      comment.deleteMany({userId:id}),
      feedModel.deleteMany({userId:id}),
      User.deleteMany({_id:id}), 
    ])

    return res.status(200).json({
      msg: "Deleted profile Successfully",
    });
  } catch (err) {
    console.log("err>>",err)
    return res.status(500).json({ msg: "Server error" });
  }
};
