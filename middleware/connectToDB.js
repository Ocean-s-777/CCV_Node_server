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

async function returnUserCollection() {
  const db = await connectToDatabase();
  const userCollection = await db.collection("users");
  return userCollection;
}

async function returnGenCollection() {
  const db = await connectToDatabase();
  const generated = await db.collection("generatedViews");
  return generated;
}

async function returnByUsername(username) {
  const userCollection = await returnUserCollection();
  const user = await userCollection.findOne({ username: username });
  return user;
}

async function returnById(id) {
  const userCollection = await returnUserCollection();
  const user = await userCollection.findOne({ id: id });
  return user;
}

module.exports = { connectToDatabase, returnUserCollection, returnGenCollection, returnByUsername };