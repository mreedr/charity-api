import mongoose from 'mongoose';

let SongSchema = mongoose.Schema({
  name: String,
  mp3_url: String,
  image_url: String,
  vote_count: Number
});

let SongModel = mongoose.model('Song', SongSchema);

export default SongModel;
