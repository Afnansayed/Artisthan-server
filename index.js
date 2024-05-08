const express = require('express');
const cors =  require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;

//Middleware
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

//MONGODB
//console.log(process.env.DB_KEY);


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_KEY}@cluster0.khblnbj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const cookieOption = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" ? true: false,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
 }

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
  //  await client.connect();
   
   //for authentication
    app.post('/jwt',async(req,res) => {
          const user = req.body;
          console.log(user)

          const token = jwt.sign(user,process.env.DB_token,{expiresIn: '1h'});
          res.cookie('token',token,cookieOption)
          .send({success: true})
    })
    app.post('/logOut',async(req,res) =>{
      const user = req.body;

      res.clearCookie('token',{...cookieOption, maxAge: 0}).send({success: true});

    })


    //api related data
    const artsCollection = client.db('artsDB').collection('allArt');
    //get all data
    app.get('/allArt', async(req,res) => {
         const cursor = artsCollection.find();
         const result = await cursor.toArray();
         res.send(result)
    })
    //get single data
    app.get('/allArt/:id',async (req,res)=> {
          const id = req.params.id;
          const query = {_id: new ObjectId(id)};
          const result = await artsCollection.findOne(query);
          res.send(result);
    })
    //insert one data
    app.post('/allArt',async(req,res) => {
          const art = req.body;
          const result = await artsCollection.insertOne(art);
          res.send(result);
    })
    //Update data
    app.put('/allArt/:id',async(req,res)=> {
          const art = req.body;
          const id = req.params.id;
          const filter = {_id: new ObjectId(id)};
          const options = {upsert: true};
          const updatedArt = {
            $set:{
              image: art.image,
              item_name: art.item_name,
              subcategory_Name:art.subcategory_Name,
              shortDescription: art.shortDescription,
              price: art.price,
              rating: art.rating,
              customization: art.customization,
              processing_time:art.processing_time,
              stockStatus:art.stockStatus
            }
          }
          const result = await artsCollection.updateOne(filter,updatedArt,options);
          res.send(result)
    })
    //Delete
    app.delete('/allArt/:id',async(req,res) => {
           const id = req.params.id;
           const query = {_id: new ObjectId(id)};
           const result = await artsCollection.deleteOne(query);
           res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res) => {
    res.send('Assignment ten server site is running');
})

app.listen(port,() =>{
    console.log(`Assignment ten server is running on port ${port}`)
})

