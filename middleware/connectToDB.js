const mongodb = require("mongodb")
const MongoClient = mongodb.MongoClient

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

module.exports = { connectToDatabase }