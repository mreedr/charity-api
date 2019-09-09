import mongoose from 'mongoose';

let VoteSchema = mongoose.Schema({
  name: String,
  email: String,
  chargeId: String,
  songId: String
});

let VoteModel = mongoose.model('Vote', VoteSchema);

export default VoteModel;
