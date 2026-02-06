const mongoose = require('mongoose');

const connectDB = async db => {
  try {
    await mongoose.connect(db);
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    // Don't crash the server - SQLite is primary database now
    throw err; // Throw error but don't exit process
  }
};

module.exports = connectDB;
