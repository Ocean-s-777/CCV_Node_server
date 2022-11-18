const express = require('express')
const router = express.Router()
const connectToDatabase = require('../middleware/connectToDB').connectToDatabase

router.get("/", async (req, res) => {
    try {
        const db = await connectToDatabase()
        const collection = await db.collection("db")
        const data = await collection.find({}).toArray()
        res.json(data)
    } catch (err) {
        console.error(err);
        res.json({ error: err })
    }
})

module.exports = router