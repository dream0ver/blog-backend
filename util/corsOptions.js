const whitelist = [
  "http://localhost:3000",
  "https://blog-backend-m9ci.onrender.com",
  "https://soft-treacle-47e3b0.netlify.app"
]
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS Bye Bye."))
    }
  },
  optionsSuccessStatus: 200,
  credentials: true
}
module.exports = { corsOptions, whitelist }
