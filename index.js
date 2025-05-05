const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const loanRoutes = require('./routes/loanRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

// Import database connection
const connectDB = require('./config/database');

// Import error handler
const errorHandler = require('./middleware/errorHandler');

// Connect to MongoDB
connectDB();

// Initialize express app
const app = express();

// Body parser middleware
app.use(express.json());

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/webhooks', webhookRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('CrediKhaata API is running...');
});



// Error handling middleware
app.use(errorHandler);

// Handle undefined routes
app.all('*', (req, res) => {
    res.status(404).json({
      status: 'fail',
      message: `Can't find ${req.originalUrl} on this server!`
    });
});

// Set port
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
