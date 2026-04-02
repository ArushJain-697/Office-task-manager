const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors()); 
app.use(express.json()); 

// Your basic test route
app.get('/api', (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

// --- FAKE DATABASE ---
// This array will hold the data temporarily while the server runs
const users = [];

// --- ENDPOINT TO STORE DATA ---
app.post('/api/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Just save exactly what the frontend sends
  const newUser = { 
    id: users.length + 1, 
    username: username, 
    password: password 
  };
  
  users.push(newUser);

  // Send success response back to frontend
  res.status(201).json({ 
    message: "Data received and stored!", 
    user: newUser 
  });
});

// --- ENDPOINT TO VIEW DATA ---
// The frontend guy can hit this to prove the data actually saved
app.get('/api/users', (req, res) => {
  res.json(users);
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});