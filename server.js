if (process.env.NODE_ENV !== "production") {
  require("dotenv").config()
}

const express = require("express")
const app = express()

// Routes
app.use('/', require('./routes/graphData'))
app.use('/profile', require('./routes/profile'))
app.use('/custom', require('./routes/customViews'))
app.get('/*', (req, res) => {
    res.status(404).json({ message: '404' })
})

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`)
})
