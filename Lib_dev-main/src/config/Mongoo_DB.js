const { MongoClient, ServerApiVersion, GridFSBucket} = require('mongodb');
const uri = process.env.DB_MONGOODB;

// Create a MongoClient with specific options
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


module.exports = client;
    