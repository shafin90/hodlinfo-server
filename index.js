const express = require('express');
const axios = require('axios');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection string
const mongoURI = 'mongodb+srv://mashrafiahnam:IOwrG4DoOlIGCD3G@cluster0.yhuz2xd.mongodb.net/?retryWrites=true&w=majority'; // Replace with your MongoDB URI

// Connect to MongoDB
const client = new MongoClient(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectToMongo() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

connectToMongo();

// Fetch data from the API and store in MongoDB
const fetchData = async () => {
  try {
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const data = response.data;

    

    // Extract and insert the top 10 data into MongoDB
    const top10Data = Object.values(data).slice(0, 10);

    const db = client.db('InternShalaTask'); // Specify the database name

    // Clear existing data
    await db.collection('task').deleteMany({});

    // Insert data into the 'collections' collection
    await db.collection('task').insertMany(top10Data);

    console.log('Data inserted successfully.');
  } catch (error) {
    console.error('Error fetching and inserting data:', error);
  }
};

// Run the fetchData function at regular intervals (e.g., every hour)
setInterval(fetchData,60000); // 1 hour interval

// Route to retrieve data
app.get('/crypto-data', async (req, res) => {
  try {
    const db = client.db('InternShalaTask'); // Specify the database name
    const data = await db.collection('task').find({}).toArray();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
