import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import Photo from './src/photo.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Habilita CORS para todas las rutas

// MongoDB Connection
mongoose.connect('mongodb://database:27017', { useNewUrlParser: true, useUnifiedTopology: true });

// API Routes
app.post('/api/photos', async (req, res) => {
  try {
    const { base64Image, uploadDate } = req.body;

    // Guardar en MongoDB
    const photo = new Photo({
      base64Image,
      uploadDate
    });

    await photo.save();

    res.status(201).json({ message: 'Photo saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/photos', async (req, res) => {
  try {
    const photos = await Photo.find();
    res.status(200).json(photos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Reemplaza con el origen correcto de tu aplicación de frontend
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
