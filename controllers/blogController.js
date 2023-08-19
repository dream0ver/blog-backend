const pool = require("../util/db")
const queries = require("../util/queries")
const ROLES = require("../util/roles")
const createErrRes = require("../util/createErrRes")

const createPost = async (req, res) => {
  const { title, body, category, image } = req.body
  if (!title || !body || !category)
    return createErrRes(
      res,
      err,
      "Post title,body and category are required fields.",
      400
    )
  try {
    const result = await pool.query(queries.getUserByUsername, [req.userName])
    if (!result.rowCount)
      return createErrRes(res, err, "User does not exist.", 403)
    await pool.query(queries.createPostQuery, [
      req.userId,
      title,
      body,
      image || null,
      category
    ])
    res.status(201).json({ message: "Successfully Created the Post." })
  } catch (err) {
    createErrRes(res, err, "Error occurred while creating new post.")
  }
}

const editPost = async (req, res) => {
  const { id, title, body, category, image } = req.body
  try {
    const foundPost = await pool.query(
      "SELECT * from posts WHERE user_id = $1 AND id = $2",
      [req.userId, id]
    )
    const existingPost = foundPost?.rows[0]
    if (!foundPost.rowCount)
      return createErrRes(res, err, "Post does not exist.", 404)
    await pool.query(queries.editPostQuery, [
      title || existingPost.title,
      body || existingPost.body,
      image || existingPost.image,
      category || existingPost.category,
      id,
      req.userId
    ])
    res.status(201).json({ message: "Successfully Edited the Post." })
  } catch (err) {
    createErrRes(res, err, "Error occurred while trying to edit the post.")
  }
}

const getPostsByCategory = async (req, res) => {
  const category = req.query?.cat
  const query = category
    ? "SELECT * from posts WHERE category = $1"
    : "SELECT * from  posts ORDER BY id"
  try {
    const result = await pool.query(query, category ? [category] : [])
    res.status(200).json(result.rows)
  } catch (err) {
    createErrRes(res, err, "Error occurred while fetching posts.")
  }
}

const getPostById = async (req, res) => {
  const id = req.params.id
  try {
    const result = await pool.query(
      "SELECT posts.* , users.username from posts INNER JOIN users ON posts.user_id = users.id WHERE posts.id = $1",
      [id]
    )
    if (!result.rowCount)
      return createErrRes(res, err, "Post does not exist.", 404)
    res.status(200).json(result.rows[0])
  } catch (err) {
    createErrRes(res, err, "Error occurred while fetching post details.")
  }
}

const deletePost = async (req, res) => {
  const id = req.params?.id
  if (!id) return createErrRes(res, err, "ID param required.", 400)
  try {
    const result = await pool.query("SELECT * from posts WHERE id = $1", [id])
    if (!result.rowCount)
      return res.status(404).json({
        message: "Post does not exist."
      })
    const hasPermission =
      result.rows[0].user_id == req.userId ||
      req.rolesList.includes(ROLES.ADMIN)

    if (hasPermission) {
      await pool.query("DELETE FROM posts WHERE id = $1", [id])
      return res.status(200).json({ message: `Post successfully deleted.` })
    } else {
      res
        .status(401)
        .json({ message: "You are not authorized to delete this post." })
    }
  } catch (err) {
    createErrRes(res, err, "Error occurred while deleting post.")
  }
}

module.exports = {
  createPost,
  editPost,
  deletePost,
  getPostsByCategory,
  getPostById
}
