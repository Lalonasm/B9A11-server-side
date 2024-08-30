const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;


const app = express();

const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
    ],
    credentials: true,
    optionSuccessStatus: 200,
}

app.use(cors(corsOptions));
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gbneo1a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        const booksCollection = client.db('library').collection('books');
        const borrowCollection = client.db('library').collection('borrow');

        // get all books data from db
        app.get('/books', async (req, res) => {
            const result = await booksCollection.find().toArray()

            res.send(result)
        })

        // get a single book data from db
        app.get('/book/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await booksCollection.findOne(query);
            res.send(result)
        })

        // Save a book data in db
        app.post('/book', async (req, res) => {
            const bookData = req.body

            const result = await booksCollection.insertOne(bookData)
            res.send(result)
        })

        // Save a bid data in db
        app.post('/borrow', async (req, res) => {
            const borrowData = req.body;
            // console.log(bidData);
            // return;
            const result = await borrowCollection.insertOne(borrowData);
            res.send(result);
        })
        // Save a bid data in db
        app.post('/book', async (req, res) => {
            const bookData = req.body;
            const result = await borrowCollection.insertOne(bookData);
            res.send(result);
        })


        // await client.connect();
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
    res.send('book library is running ')
});


app.listen(port, () => {
    console.log(`Book Library Server is running on port ${port}`)
})