const getUserByUsername = "SELECT * from users WHERE username = $1"
const getUserByRefreshToken = "SELECT * from users WHERE refresh_token = $1"
const registerQuery =
  "INSERT INTO users (username,password,roles) VALUES ($1,$2,$3)"
const updateRefreshToken =
  "UPDATE users SET refresh_token = $1 WHERE username = $2"
const createPostQuery =
  "INSERT INTO posts (user_id,title,body,image,category) VALUES($1,$2,$3,$4,$5)"
const editPostQuery =
  "UPDATE posts SET title=$1,body=$2,image=$3,category=$4 WHERE id=$5 AND user_id=$6"
module.exports = {
  getUserByUsername,
  registerQuery,
  updateRefreshToken,
  getUserByRefreshToken,
  createPostQuery,
  editPostQuery
}
