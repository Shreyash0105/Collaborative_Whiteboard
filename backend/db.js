const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

const connectToDatabase = async () => {
    try {
        // Use an environment variable for security
        const url = process.env.MONGO_URI; 
        
        await mongoose.connect(url); 
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ Database connection error:', err.message);
        process.exit(1); // Stop the server if DB fails to connect
    }
};

module.exports = connectToDatabase;