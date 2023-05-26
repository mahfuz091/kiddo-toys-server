const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
// const corsConfig = {
//   origin: '',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE']
// }
// app.use(cors(corsConfig))
// app.options("", cors(corsConfig))
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1maxaaz.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser: true,
  UseUnifiedTopology: true,
  maxPoolSize: 10,
});

async function run() {




  try {
    // Connect the client to the server	(optional starting in v4.7)
    // client.connect((err) => {
    //   if (err) {
    //     console.error(err);
    //     return;
    //   }
    // });



    const toyCollection = client.db("toyDB").collection("toys");

    // const indexKeys = { name: 1 };
    // const indexOptions = { name: "toyName" };

    // const result = await toyCollection.createIndex(indexKeys, indexOptions);

    app.get("/toysBySearch/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await toyCollection
        .find({
          $or: [{ name: { $regex: searchText, $options: "i" } }],
        })
        .toArray();
      res.send(result);
    });

    app.get("/toys", async (req, res) => {
      const result = await toyCollection.find().limit(20).toArray();
      res.send(result);
    });

    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.get("/category", async (req, res) => {
      console.log(req.query.subcategory);
      let query = {};
      if (req.query.subcategory) {
        query = { subcategory: req.query.subcategory };
      }

      const result = await toyCollection.find(query).limit(2).toArray();
      res.send(result);
    });

    app.get("/user", async (req, res) => {
      console.log(req.query);
      const type = req.query.type === "ascending";
      const value = req.query.value;
      let query = {};
      if (req.query.sellerEmail) {
        query = { sellerEmail: req.query.sellerEmail };
      }
      let sortObj = {};
      sortObj[value] = type ? 1 : -1;
      const result = await toyCollection.find(query).sort(sortObj).toArray();
      res.send(result);
    });

    app.post("/postToys", async (req, res) => {
      const toys = req.body;
      console.log(toys);
      const result = await toyCollection.insertOne(toys);
      res.send(result);
    });


    app.patch("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          price: body.price,
          availableQuantity: body.availableQuantity,
          details: body.details,
        },
      };
      const result = await toyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });




    // Send a ping to confirm a successful connection
    // client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
