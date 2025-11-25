const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

app.use(cors());
app.use(express.json());
const port = process.env.port || 5000;



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@kajwala.9fiaw1u.mongodb.net/?appName=kajwala`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db("ecoMart");
    const productsCollection = db.collection("products");

    //        POST API
    // ----------------------------
    app.post("/products", async (req, res) => {
      try {
        const product = req.body;

        // Add auto timestamp if missing
        product.addTime = product.addTime || new Date();

        const result = await productsCollection.insertOne(product);

        res.status(201).send({
          success: true,
          message: "Product added successfully",
          insertedId: result.insertedId,
        });
      } catch (error) {
        console.error("Error inserting product:", error);
        res.status(500).send({ success: false, message: "Server Error" });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
