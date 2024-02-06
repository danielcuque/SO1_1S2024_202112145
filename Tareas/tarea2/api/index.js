const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');


const app = express();
const PORT = 3001;

app.use(cors());

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

mongoose.connect('mongodb://mongodb:27017/tarea2', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Conectado a la base de datos');
});

const photoSchema = new mongoose.Schema({
  image: String,
  uploadDate: Date
});

const Photo = mongoose.model('Photo', photoSchema);

app.get('/api/photos', async (req, res) => {
  try {
    const photos = await Photo.find();
    res.json(photos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las fotos' });
  }
});

app.post('/api/photos', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'La foto no puede estar vacía' });
    }

    console.log(image);

    const photo = new Photo({
      image: image,
      uploadDate: new Date()
    });
    await photo.save();
    res.json(photo);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al guardar la foto' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});