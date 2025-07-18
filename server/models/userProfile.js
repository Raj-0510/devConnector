const mg = require("mongoose");

const userProfileSchema = new mg.Schema({
  userId: {
    type: mg.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    required: true,
  },
  experience: [
    {
      company: { type: String, required: true },
      position: { type: String, required: true },
      duration: { type: String, required: true },
    },
  ],
  skills: {
    type: String,
    required: true,
  },
  githubLink: {
    type: String,
    required: true,
  },
  linkedInLink: {
    type: String,
    required: true,
  },
  image: { type: String, required: true },

  followers: [{ type: mg.Schema.Types.ObjectId,ref: "userProfile"  }],

  following: [{ type: mg.Schema.Types.ObjectId,ref: "userProfile"  }],
});

userProfileSchema.index({ userName: "text", positions: "text" });

module.exports = mg.model("userProfile", userProfileSchema);
