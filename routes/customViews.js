const express = require('express')
const uuid4 = require('uuid4')
const router = express.Router()
const connectToDatabase = require('../middleware/connectToDB').connectToDatabase
const returnUserCollection = require('../middleware/connectToDB').returnUserCollection
const returnGenCollection = require('../middleware/connectToDB').returnGenCollection
const returnByUsername = require('../middleware/connectToDB').returnByUsername
const passport = require('../middleware/auth');



router.post('/create', passport.authenticate('jwt', { session: false }), async (req, res) => {

    let title = req.body.title
    let columns = req.body.columns
    let visualizations = req.body.visualizations
    let descriptions = req.body.descriptions
    let userId = req.user.id

    if (title === undefined || columns === undefined || visualizations === undefined || descriptions === undefined) {
        res.status(400).json({ message: "Missing data" })
    }
    else {
        const genCollection = await returnGenCollection()
        const userCollection = await returnUserCollection()
        let newView = {
            id: uuid4(),
            title: title,
            columns: columns,
            visualizations: visualizations,
            descriptions: descriptions,
            owner: userId
        }
        await genCollection.insertOne(newView)
        await userCollection.updateOne({ id: userId }, { $push: { userViews: newView.id } })
        res.status(200).json({ message: "View created", id: newView.id })
    }
})

router.delete('/deleteView', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let viewId = req.body.id
    let userId = req.user.id
    if (viewId === undefined) {
        res.status(400).json({ message: "Missing data" })
    }
    else {
        const genCollection = await returnGenCollection()
        const view = await genCollection.findOne({ id: viewId })

        if (view === null || view.owner !== userId) {
            res.status(400).json({ message: "View does not exist or you do not own it" })
        }
        else {
            const genCollection = await returnGenCollection()
            const userCollection = await returnUserCollection()

            await genCollection.deleteOne({ id: viewId })
            await userCollection.updateOne({ id: userId }, { $pull: { userViews: viewId } })
            res.status(200).json({ message: "View deleted" })
        }
    }
})

router.post('/getView', async (req, res) => {
    let viewId = req.body.id
    if (viewId === undefined) {
        res.status(400).json({ message: "Missing data" })
    }
    else {
        const genCollection = await returnGenCollection()
        const view = await genCollection.findOne({ id: viewId })
        if (view === null) {
            res.status(400).json({ message: "View does not exist" })
        }
        else {
            res.status(200).json(view)
        }
    }
})

router.get("/getAllUserViews", passport.authenticate('jwt', { session: false }), async (req, res) => {
    let userId = req.user.id
    const genCollection = await returnGenCollection()

    const userViews = await genCollection.find({ owner: userId }).toArray()
    res.status(200).json(userViews)
})

module.exports = router;