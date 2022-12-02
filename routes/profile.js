const express = require('express');
const uuid4 = require('uuid4');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt;
const router = express.Router()
const connectToDatabase = require('../middleware/connectToDB').connectToDatabase

let jwtSecret = null;
if(process.env.JWTKEY === undefined) {
    console.log("JWTKEY not found in environment variables. Server might not work properly.")
} else {
    jwtSecret = process.env.JWTKEY;
}

let parameters = {}

parameters.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
parameters.secretOrKey = jwtSecret

passport.use(new LocalStrategy(
    async function(userName, password, done) {
        let user;
        try {
            const db = await connectToDatabase()
            const userCollection = await db.collection("users")
            user = await userCollection.findOne({ username: userName })
            if(!user) {
                return done(null, false);
            }
        } catch (e) {
            return done(e);
        }
        
        let match = await bcrypt.compare(password, user.password)

        if(!match) {
            return done(null, false);
        }
        
        return done(null, user);
    }
  ));

passport.use(new JwtStrategy(parameters, function(jwt_payload, done) {
    console.log("Processing JWT payload for token content:")
    console.log(jwt_payload);

    const now = Date.now() / 1000
    if(jwt_payload.exp > now) {
        done(null, jwt_payload)
        console.log("JWT token is valid")
    }
    else {
        done(null, false)
    }
}));



router.post('/register', async (req, res) => {
    if (req.body.password === undefined || req.body.username === undefined) {
        res.status(400).json({ message: "Bad request" })
    } else {
        if (req.body.password.length < 8) {
            res.status(400).json({ message: "Password must be at least 8 characters long" })
        }
        else {
        const db = await connectToDatabase()
        const userCollection = await db.collection("users")
        const user = await userCollection.findOne({ username: req.body.username })
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
                const parameters = {
                    expiresIn: "1d"
                }
                const token = jwt.sign(payload, jwtSecret, parameters)

                res.status(201).json({ token: token })
            }
        }
    }
})

router.post('/login', passport.authenticate('local', { session: false }), async (req, res) => {
    const payload = {
        id: req.user.id,
        username: req.user.username
    }
    const parameters = {
        expiresIn: "1d"
    }
    const token = jwt.sign(payload, jwtSecret, parameters)

    res.status(200).json({ token: token })
})

router.get('/verify', passport.authenticate('jwt', { session: false }), async (req, res) => {
    
    res.status(200).json({ message: "Valid" })
})


module.exports = router;