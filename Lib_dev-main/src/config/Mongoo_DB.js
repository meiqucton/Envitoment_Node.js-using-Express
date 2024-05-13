const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.DB_MONGOODB;

// Create a MongoClient with specific options
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Kết nối Mongoodb thành công!");
  } finally {
    await client.close();
  }
}
run();
module.exports = client;
