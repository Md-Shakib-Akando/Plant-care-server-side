require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());










const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2w1crbt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        
        // Send a ping to confirm a successful connection

        const plantCollection = client.db('PlantDB').collection('plants');
        const userCollection = client.db('PlantDB').collection('users');

        app.get('/plants/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await plantCollection.findOne(query);
            res.send(result);
        })

        app.get('/plants', async (req, res) => {
            const result = await plantCollection.find().toArray();
            res.send(result)
        })

        app.post('/plants', async (req, res) => {
            const newPlant = {
                ...req.body,
                nextWatering: new Date(req.body.nextWatering),
                createdAt: new Date()
            };
            const result = await plantCollection.insertOne(newPlant);
            res.send(result);
        })
        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray()
            res.send(result)
        })

        app.get('/latest-plants', async (req, res) => {
            const result = await plantCollection
                .find()
                .sort({ createdAt: -1 })
                .limit(6)
                .toArray();

            res.send(result);
        });



        app.get('/plants-sorted', async (req, res) => {
            const sortBy = req.query.sortBy;

            let sortStage = [];

            if (sortBy === 'careLevel') {
                sortStage = [
                    {
                        $addFields: {
                            careLevelRank: {
                                $switch: {
                                    branches: [
                                        { case: { $eq: ["$careLevel", "easy"] }, then: 1 },
                                        { case: { $eq: ["$careLevel", "moderate"] }, then: 2 },
                                        { case: { $eq: ["$careLevel", "difficult"] }, then: 3 },
                                    ],
                                    default: 4
                                }
                            }
                        }
                    },
                    { $sort: { careLevelRank: 1 } }
                ];
             }
             else if (sortBy === 'nextWatering') {
                sortStage = [
                    {
                        $addFields: {
                            nextWateringDate: { $toDate: "$nextWatering" }
                        }
                    },
                    { $sort: { nextWateringDate: 1 } }
                ];
            }

            const result = await plantCollection.aggregate(sortStage).toArray();
            res.send(result);
        });



        app.post('/users', async (req, res) => {
            const userProfile = req.body;

            const result = await userCollection.insertOne(userProfile);
            res.send(result);
        })
        app.put('/plants/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedCoffee = req.body;
            const updateDoc = { $set: updatedCoffee };
            const result = await plantCollection.updateOne(filter, updateDoc);
            res.send(result);
        });



        app.delete('/plants/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await plantCollection.deleteOne(query);
            res.send(result);
        })



        
    } finally {
        
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Plant server is created successful");
})



app.listen(port, () => {
    console.log(`port on ${port}`);
})