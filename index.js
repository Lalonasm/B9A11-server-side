const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;


const app = express();

const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://oxford-a11.web.app'
    ],
    credentials: true,
    optionSuccessStatus: 200,
}

app.use(cors(corsOptions));
app.use(express.json());
// app.use(cookieParser());

// middlewares
// const logger = (req, res, next) => {
//     console.log('log:info', req.method, req.url);
//     next();
// }

// const verifyToken = (req, res, next) => {
//     const token = req?.cookies?.token;
//     console.log('token in the middleware', token);
//     if (!token) {
//         return res.status(401).send({ message: 'Unauthorized access' })
//     }
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//         if (err) {
//             return res.status(401).send({ message: 'unauthorized access' })
//         }
//         req.user = decoded;
//         next();
//     })
//     // next();
// }
// verify jwt middleware
// const verifyToken = (req, res, next) => {
//     const token = req.cookies?.token
//     if (!token) return res.status(401).send({ message: 'unauthorized access' })
//     if (token) {
//         jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//             if (err) {
//                 console.log(err)
//                 return res.status(401).send({ message: 'unauthorized access' })
//             }
//             console.log(decoded)

//             req.user = decoded
//             next()
//         })
//     }
// }


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



        // auth related api
        // app.post('/jwt', logger, async (req, res) => {
        //     const user = req.body;
        //     console.log('user for token', user);
        //     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1hr' });

        //     res.cookie('token ', token, {
        //         httpOnly: true,
        //         secure: true,
        //         sameSite: 'none'
        //     })
        //         .send({ success: true })
        // })

        // app.post('/logout', async (req, res) => {
        //     const user = req.body;
        //     console.log('logging out', user);
        //     res.clearCookie('token', { maxAge: 0 })
        //         .send({ success: true })
        // })

        // get all books data from db
        app.get('/books', async (req, res) => {

            // console.log('token owner info:', req.user);

            // if (req.user.email !== req.query.email) {
            //     return res.status(403).send({ message: 'forbidden access' })
            // }

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

            const result = await borrowCollection.insertOne(borrowData);
            res.send(result);
        })
        // Save a bid data in db
        app.post('/book', async (req, res) => {
            const bookData = req.body;
            const result = await borrowCollection.insertOne(bookData);
            res.send(result);
        })

        // get all books posted by a specific user
        app.get('/books/:email', async (req, res) => {

            // const tokenEmail = req.user.email
            const email = req.params.email
            // if (tokenEmail !== email) {
            //     return res.status(403).send({ message: 'forbidden access' })
            // }
            const query = { 'borrower.email': email }
            const result = await booksCollection.find(query).toArray();
            res.send(result);
        });

        // delete a book data from db
        app.delete('/book/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await booksCollection.deleteOne(query);
            res.send(result);
        });

        // update a job in db
        app.put('/book/:id', async (req, res) => {
            const id = req.params.id;
            const bookData = req.body;
            const query = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    ...bookData,
                }
            };
            const result = await booksCollection.updateOne(query, updateDoc, options);
            res.send(result)
        }
        )



        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('book library is running ')
});


app.listen(port, () => {
    console.log(`Book Library Server is running on port ${port}`)
})