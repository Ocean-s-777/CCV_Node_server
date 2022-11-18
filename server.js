if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongodb = require("mongodb");
const port = process.env.PORT || 3000;
const app = express();
const MongoClient = mongodb.MongoClient;

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  const client = await MongoClient.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = client.db("climate-change");

  cachedClient = client;
  cachedDb = db;
  return db;
}

app.get("/db", async (req, res) => {
  const db = await connectToDatabase();
  const collection = await db.collection("db");
  const data = await collection.find({}).toArray();
  res.json(data);
});

app.listen(port, () => {
  console.log(`Running on port ${process.env.PORT}`);
});
