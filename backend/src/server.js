require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const profileRoutes = require('./routes/profile');
app.use('/api/profile', profileRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('QuickCourt Backend API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
