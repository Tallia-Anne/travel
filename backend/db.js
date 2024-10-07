// db.js
require('dotenv').config();
const mongoose = require('mongoose');

// Fonction pour connecter à MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error("MongoDB URI is missing in the environment variables");
    }

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Temps avant que le serveur ne timeout si la connexion échoue
    });

    console.log('Successfully connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1); // Quitte l'application si la connexion échoue
  }
};

// Gérer les événements de connexion
mongoose.connection.on('error', (err) => {
  console.error('Connection error:', err.message);
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB!');
});

module.exports = connectDB;
