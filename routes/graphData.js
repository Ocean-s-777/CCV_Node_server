const express = require('express')
const router = express.Router()
const connectToDatabase = require('../middleware/connectToDB').connectToDatabase

async function packResponse(staticViewAddress) {
    // Connect to database
    const db = await connectToDatabase()
    let viewCollection = await db.collection("staticViews")
    let staticView = await viewCollection.findOne({viewName: staticViewAddress})
    let dataset = {}
    let promises = []
    //Making promises for each dataset
    for (let i = 0; i < staticView.data.length; i++) {
        let dynamicCollection = await db.collection(staticView.data[i])
        promises.push(dynamicCollection.find({}).toArray())
    }
    //Waiting for all promises to resolve
    let responses = await Promise.all(promises)
    for (let i = 0; i < staticView.data.length; i++) {
        dataset[staticView.data[i]] = responses[i]
    }
    //Returning the dataset
    return dataset
}

// router.get("/db", async (req, res) => {
//     try {
//         const db = await connectToDatabase()
//         const collection = await db.collection("v1_g_a")
//         const data = await collection.find({}).toArray()
//         res.json(data)
//     } catch (err) {
//         console.error(err);
//         res.json({ error: err })
//     }
// })

router.get("/v1-2", async (req, res) => {
    try {
        let data = await packResponse("v1-2")
        res.json(data)
    } catch (err) {
        console.error(err);
        res.json({ error: err })
    }
})

module.exports = router