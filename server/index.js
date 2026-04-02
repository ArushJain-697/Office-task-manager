const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); // Allows your React frontend to talk to this backend
app.use(express.json()); // Allows your server to accept JSON data

// A basic test route
app.get('/api', (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

// CRUCIAL FOR RAILWAY: Use process.env.PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});