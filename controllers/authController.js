const bcrypt = require("bcrypt")
const ROLES = require("../util/roles")
const pool = require("../util/db")
const jwt = require("jsonwebtoken")
const queries = require("../util/queries")
const createErrRes = require("../util/createErrRes")

const registerUser = async (req, res) => {
  const { username, password } = req.body
  if (!username || !password)
    return res
      .status(400)
      .json({ message: "Username and Password are required fields." })
  try {
    const result = await pool.query(queries.getUserByUsername, [username])
    if (result.rowCount > 0)
      return res.status(409).json({ message: "Username is already taken." })
    const hashedPwd = bcrypt.hashSync(password, 10)
    await pool.query(queries.registerQuery, [username, hashedPwd, [ROLES.USER]])
    return res.status(201).json({ message: "Registration Successfull." })
  } catch (err) {
    createErrRes(res, err, "Error Occured During Registration.")
  }
}

const loginUser = async (req, res) => {
  const { username, password } = req.body
  if (!username || !password)
    return res
      .status(400)
      .json({ message: "Username and Password are required fields." })

  try {
    const result = await pool.query(queries.getUserByUsername, [username])
    if (!result.rowCount)
      return res.status(404).json({ message: "User doest not exist." })
    const hash = result.rows[0].password
    const isPasswordMatch = bcrypt.compareSync(password, hash)
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Unauthorized access." })
    } else {
      const refresh_token = jwt.sign({ username }, process.env.REFRESH_SECRET, {
        expiresIn: "1d"
      })
      const access_token = jwt.sign(
        { username, id: result.rows[0].id, roles: result.rows[0].roles },
        process.env.ACCESS_SECRET,
        {
          expiresIn: "10s"
        }
      )
      await pool.query(queries.updateRefreshToken, [refresh_token, username])
      const cookieConfig = {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
      }
      if (process.env.ENVIRONMENT == "Production") {
        cookieConfig.sameSite = "None"
        cookieConfig.secure = true
      }
      res.cookie("rt_cookie", refresh_token, cookieConfig)
      return res.status(200).json({
        access_token,
        username,
        roles: result.rows[0].roles,
        id: result.rows[0].id
      })
    }
  } catch (err) {
    createErrRes(res, err, "Error Occured While trying to Login.")
  }
}

const generateAccessToken = async (req, res) => {
  const rt = req?.cookies?.rt_cookie
  if (!rt) return res.status(403).json({ message: "Unauthorized access." })
  try {
    const result = await pool.query(queries.getUserByRefreshToken, [rt])
    if (!result.rowCount)
      return res.status(401).json({ message: "Unauthorized access." })
    jwt.verify(rt, process.env.REFRESH_SECRET, (err, decoded) => {
      if (err) return createErrRes(res, err, "Refresh Token Expired.", 401)
      const access_token = jwt.sign(
        {
          username: decoded.username,
          id: result.rows[0].id,
          roles: result.rows[0].roles
        },
        process.env.ACCESS_SECRET,
        {
          expiresIn: "10s"
        }
      )
      return res.status(200).json({
        access_token,
        roles: result.rows[0].roles,
        id: result.rows[0].id,
        username: decoded.username
      })
    })
  } catch (err) {
    createErrRes(res, err, "Error Occured while generating access token.")
  }
}

const logout = async (req, res) => {
  const rt = req?.cookies?.rt_cookie
  if (!rt) return res.status(400).json({ message: "Unauthorized access." })
  try {
    const result = await pool.query(queries.getUserByRefreshToken, [rt])
    if (!result.rowCount) {
      res.clearCookie("rt_cookie")
      return res.status(401).json({ message: "Unauthorized access." })
    }
    jwt.verify(rt, process.env.REFRESH_SECRET, async (err, decoded) => {
      if (err) return createErrRes(res, err, "Refresh Token Expired.", 401)
      await pool.query(queries.updateRefreshToken, [null, decoded.username])
      res.clearCookie("rt_cookie")
      return res.status(200).json({ message: "User successfully logged out." })
    })
  } catch (err) {
    createErrRes(res, err, "Error Occured while trying to logout.")
  }
}

module.exports = {
  registerUser,
  loginUser,
  generateAccessToken,
  logout
}
