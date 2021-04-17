const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { ObjectId } = require('mongodb')
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.scuyw.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()
app.use(fileUpload())
app.use(bodyParser.json());
app.use(cors());


const port = 5000;

app.get('/', (req, res) => {
    res.send("hello from mongodb it's working")
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const serviceCollection = client.db("topTech").collection("services");
    const adminCollection = client.db("topTech").collection("admins");
    const orderCollection = client.db("topTech").collection("orders");
    const reviewCollection = client.db("topTech").collection("reviews");


    app.post('/addOrder', (req, res) => {
        const order = req.body;
        orderCollection.insertOne(order)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })

    app.get('/allAdmins/:email', (req, res) => {
        const email = req.params.email
        adminCollection.find({})
            .toArray((err, documents) => {
                const isAdmin = documents.find(admin => admin.email === email)
                res.send(isAdmin == undefined ? false : true)
            })
    })

    app.post('/addService', (req, res) => {
        const file = req.files.file
        const encImg = file.data.toString('base64')
        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        }
        const { title, description, price } = req.body;
        serviceCollection.insertOne({ title, description, price, image })
            .then(result => {
                return res.send(result.insertedCount > 0)
            })
    })

    app.get('/allReviews', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.get('/allServices', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.get('/allOrders', (req, res) => {
        orderCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.post('/addAdmin', (req, res) => {
        const email = req.body.email
        adminCollection.insertOne({ email })
            .then(result => {
                return res.send(result.insertedCount > 0)
            })
    })

    app.get('/userOrder/:email', (req, res) => {
        const email = req.params.email;
        orderCollection.find({ email })
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.patch('/updateOrder', (req, res) => {
        orderCollection.updateOne({ _id: ObjectId(req.body.id) },
            {
                $set: { status: req.body.status }
            })
            .then(result => {
                res.send(result)
            })
    })

    app.post('/addReview', (req, res) => {
        const data = req.body
        reviewCollection.insertOne(data)
            .then(result => {
                return res.send(result.insertedCount > 0)
            })
    })


});





app.listen(process.env.PORT || port)