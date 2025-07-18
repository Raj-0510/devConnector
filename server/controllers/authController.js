const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.registerUser = async (req, res) => {
  console.log("in registerUser")
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ msg: "User already exist" });
  } 
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new User({ email: email, password: hashedPassword });

  await user.save();
  const token = jwt.sign(
    { user: { id:  user._id } },
    process.env.SECRET_KEY,
    {
      expiresIn: "100d",
    }
  );
  res.cookie("token", token, {
    httpOnly: true,
    // secure: false,
    // sameSite: "Lax",
    secure: true,
    sameSite: None,
    maxAge: 60 * 60 * 1000,
  });

  return res.status(200).json({ msg: "User registration Successfull", token,userId:user._id });
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (isMatch) {
        const token = jwt.sign(
          { user: { id: existingUser._id } },
          process.env.SECRET_KEY,
          {
            expiresIn: "100d",
          }
        );
        res.cookie("token", token, {
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
          maxAge: 60 * 60 * 1000,
        });
        return res.status(200).json({ msg: "Login Successfull", token,userData:existingUser });
      } else {
        return res.status(400).json({ msg: "Email or password didnt match" });
      }
    } else {
      return res.status(400).json({ msg: "Email or password didnt match" });
    }
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

exports.logoutUser = async (req, res) => {
  res.clearCookie("token", {
    http: true,
    sameSite: "strict",
    secure: false,
  });
  res.json({ msg: "Logged out" });
};
