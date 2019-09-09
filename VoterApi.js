import VoteModel from './models/vote';

export default class VoterApi {
  vote(name, email, songId, chargeId) {
    return VoteModel.create({ name, email, songId, chargeId });
  }

  getAll() {
    return VoteModel.find({});
  }

  getCounts() {
    return VoteModel.aggregate()
      .group({ _id: '$songId', count: {$sum: 1 }})
      .exec((err, res) => {
        if (err) return Promise.reject(err);
        return Promise.resolve(res);
      });
  }
}
