const createErrRes = (res, err, msg, status = 500) => {
  res.status(status).json({
    error: err.message,
    message: msg
  })
}
module.exports = createErrRes
