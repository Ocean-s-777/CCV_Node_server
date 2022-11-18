if (process.env.NODE_ENV !== "production") {
  require("dotenv").config()
}

const express = require("express")
const app = express()

// Routes
app.use('/db', require('./routes/graphData'))
app.use('/profile', require('./routes/profile'))
app.use('/custom', require('./routes/customViews'))
app.get('/*', (req, res) => {
    res.status(404).json({ message: '404' })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Running on port ${process.env.PORT}`)
})
