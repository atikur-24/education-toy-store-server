const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.SECRET_KEY}@cluster0.28gkq0d.mongodb.net/?retryWrites=true&w=majority`;

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
    client.connect();

    const database = client.db('toysDB');
    const toyCollection = database.collection('toys');

    // load all toy and specific user toys
    app.get('/toys', async(req, res) => {
      let query = {};
      if(req.query?.email) {
        query = {email: req.query?.email}
      }
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });

    // data load on category wise
    app.get('/toys/:category', async(req, res) => {
      if(req.params.category == "Math" || req.params.category == "Engineering" || req.params.category == "Medical") {
        const result = await toyCollection.find({ category: req.params.category}).toArray()
        return res.send(result)
      }
    });

    app.get('/toys/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    // inserting toy
    app.post('/toys', async(req, res) => {
        const newToys = req.body;
        const result = await toyCollection.insertOne(newToys);
        res.send(result)
      });

      // update toy
      app.put('/toys/:id', async(req, res) => {
        const id = req.params.id;
        const updatedData = req.body;
        const filter = { _id: new ObjectId(id) }
        const options = { upsert: true };
        const updateToy = {
          $set: {
            name: updatedData.name,
            price: updatedData.price,
            quantity: updatedData.quantity,
            description: updatedData.description
          }
        };
        const result = await toyCollection.updateOne(filter, updateToy, options);
        res.send(result)
      })

    // delete a toy
    app.delete('/toys/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Education Toy Server is running...');
});

app.listen(port, () => {
    console.log(`Toy server is running on port ${5000}`);
})