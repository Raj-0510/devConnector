const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;
    console.log("Cookies received in middleware:", req.cookies);
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded.user; 
    next();
  } catch (err) {
    console.error("err>",err)
    res.status(401).json({ msg: "Invalid token" });
  }
};

module.exports = authMiddleware;
