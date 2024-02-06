import { Schema, model } from 'mongoose';

const photoSchema = new Schema({
  base64Image: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now }
});

const Photo = model('Photo', photoSchema);

export default Photo;