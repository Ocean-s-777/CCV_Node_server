const express = require('express');
const uuid4 = require('uuid4');
const bcrypt = require('bcryptjs');
const router = express.Router()
const connectToDatabase = require('../middleware/connectToDB').connectToDatabase
const returnUserCollection = require('../middleware/connectToDB').returnUserCollection
const returnGenCollection = require('../middleware/connectToDB').returnGenCollection
const returnByUsername = require('../middleware/connectToDB').returnByUsername
const passport = require('../middleware/auth');
const { createToken } = require('../middleware/auth');

router.post('/register', async (req, res) => {
    if (req.body.password === undefined || req.body.username === undefined) {
        res.status(400).json({ message: "Bad request" })
    } else {
        if (req.body.password.length < 8) {
            res.status(400).json({ message: "Password must be at least 8 characters long" })
        }
        else {

            const userCollection = await returnUserCollection()
            const user = await returnByUsername(req.body.username.toString())
            if (user) {
                res.status(400).json({ message: "Username exists" })
            }
            else {
                const salt = await bcrypt.genSalt(10)
                const hashedPassword = await bcrypt.hash(req.body.password.toString(), salt)
                const newUser = {
                    id: uuid4(),
                    username: req.body.username.toString(),
                    password: hashedPassword,
                    userViews: []
                }
                await userCollection.insertOne(newUser)

                const payload = {
                    id: newUser.id,
                    username: newUser.username
                }
                const token = await createToken(payload)

                res.status(201).json({ token: token, username: newUser.username })
            }
        }
    }
})

router.post('/login', passport.authenticate('local', { session: false }), async (req, res) => {
    const payload = {
        id: req.user.id,
        username: req.user.username
    }
    const token = await createToken(payload)

    res.status(200).json({ token: token, username: req.user.username })
})

router.post('/verify', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const userCollection = await returnUserCollection()
    const user = await userCollection.findOne({ id: req.user.id })
    if (user) {
        res.status(200).json({ message: "User verified", username: user.username })
    }
    else {
        res.status(401).json({ message: "User not found" })
    }
})

router.delete('/delete', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const userCollection = await returnUserCollection()
    const user = await userCollection.findOne({ id: req.user.id })
    if (user) {
        const genCollection = await returnGenCollection()
        await genCollection.deleteMany({ owner: req.user.id })
        await userCollection.deleteOne({ id: req.user.id })
        res.status(200).json({ message: "User deleted" })
    }
    else {
        res.status(401).json({ message: "User not found" })
    }
})


module.exports = router;