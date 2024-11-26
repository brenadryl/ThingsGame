const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:` +
            `${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER_URL}/` +
            `?retryWrites=true&w=majority&appName=${process.env.DB_APP_NAME}`;
const client = new MongoClient(uri);

let database;

const connectToDb = async () => {
  if (database) {
    return database;
  }
  try {
    await client.connect();
    console.log('📘 Connected to MongoDB');
    database = client.db(process.env.DB_NAME);
    return database;
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectToDb;