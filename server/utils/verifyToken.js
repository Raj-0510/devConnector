const verifyToken =  (req, res,next) => {
  const token = req?.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ msg: "Token missing" });
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};
module.exports = verifyToken;
