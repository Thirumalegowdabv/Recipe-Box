const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// This line loads your .env file
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json()); 

// --- MongoDB Connection ---
const uri = process.env.MONGODB_URI;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

// --- API Routes ---
const recipesRouter = require('./routes/recipes');
app.use('/recipes', recipesRouter);

// --- Start the Server ---
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});