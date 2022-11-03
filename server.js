if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
};

const express = require('express');

const app = express();

app.listen(process.env.PORT, () => {
    console.log(`Running on port ${process.env.PORT}`)
});

//respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
    res.send('Hello world')
});