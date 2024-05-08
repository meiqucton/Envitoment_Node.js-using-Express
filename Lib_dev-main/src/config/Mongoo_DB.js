
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.DB_MONGOODB || "mongodb+srv://Tonnn:<password>@cluster0.ektegbr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
  
});

module.exports = client;


