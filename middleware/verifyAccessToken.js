const jwt = require("jsonwebtoken")
const verifyAccessToken = (req, res, next) => {
  const Authorization = req.headers.authorization || req.headers.Authorization
  const access_token = Authorization?.split(" ")[1]
  if (!access_token)
    return res.status(401).json({ message: "Unauthorized access." })
  jwt.verify(access_token, process.env.ACCESS_SECRET, (err, decoded) => {
    if (err)
      return res
        .status(403)
        .json({ message: "Access token expired or invalid." })
    req.userId = decoded.id
    req.userName = decoded.username
    req.rolesList = decoded.roles
    next()
  })
}
module.exports = verifyAccessToken
