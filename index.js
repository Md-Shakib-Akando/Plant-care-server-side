const express =require('express');
const cors=require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const app= express();
const port=process.env.PORT || 3000;

app.use(cors());
app.use(express.json());




app.get('/',(req,res)=>{
    res.send("hello world");
})



app.listen(port,()=>{
    console.log(`port on ${port}`);
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@akando.ddfqzf0.mongodb.net/?retryWrites=true&w=majority&appName=Akando`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const userCollection=client.db('PlantsDB').collection('users')
    app.get('/users',async(req,res)=>{
      const result=await userCollection.find().toArray()
      res.send(result)
    })
    
    app.post('/users', async(req,res)=>{
      const userProfile=req.body;
     
      const result = await userCollection.insertOne(userProfile);
      res.send(result);
    })
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
