const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

    //        GET ALL PRODUCTS
    // ----------------------------
    app.get("/products", async (req, res) => {
      try {
        const products = await productsCollection.find().toArray();

        res.send({
          success: true,
          count: products.length,
          products,
        });
      } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send({
          success: false,
          message: "Server Error",
        });
      }
    });

    // Delete product by ID
    app.delete("/products/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const result = await productsCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 0)
          return res
            .status(404)
            .json({ success: false, message: "Product not found" });

        res.json({ success: true, message: "Product deleted successfully" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
      }
    });

    // Get single product by ID
    app.get("/products/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const product = await productsCollection.findOne({
          _id: new ObjectId(id),
        });
        if (!product)
          return res.status(404).json({ message: "Product not found" });

        res.json({ product });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
    });

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
