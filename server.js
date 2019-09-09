import restify from 'restify';
import mongoose from 'mongoose';
import config from './config/default';
import bluebird from 'bluebird';
import Stripe from './StripeApi';
import Voter from './VoterApi';
import corsMiddleware from 'restify-cors-middleware';
import errors from 'restify-errors';
import pasync from 'pasync';

import Songs from './songlist.json';

let stripe = new Stripe();
let voter = new Voter();

mongoose.connect(config.mongoose.url, { promiseLibrary: bluebird });

const server = restify.createServer({
  name: 'myapp',
  version: '1.0.0'
});

const cors = corsMiddleware({
  origins: ['http://localhost:3000'],
  allowHeaders: ['*']
  // exposeHeaders: ['API-Token-Expiry']
});

server.pre(cors.preflight);
server.use(cors.actual);

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());


server.get('/songs', (req, res, next) => {
  res.send(Songs);
  return next(false);
});

server.get('/songs-with-votes', (req, res, next) => {
  voter.getCounts()
    .then((counts) => {
      Songs.map((song) => {
        const count = counts.find((count) => {
          return count._id === JSON.stringify(song.id);
        });
        song.count = count && count.count || 0;
      });
      res.send(Songs);
    })
    .catch(err => res.send(res.send(new errors.InternalServerError({
      statusCode: 500,
      message: JSON.stringify(err)
    }))))
    .then(() => next());
});

server.post('/vote', (req, res, next) => {
  let { name, email, songs, token } = req.body;
  // start of promise chain
  if (songs.length === 0) {
    return res.send(new errors.InternalServerError({
      statusCode: 500,
      message: 'No songs selected'
    }));
  }

  stripe.calculateChargeAmount(songs.length)
    .then((chargeAmount) => stripe.chargeCard(chargeAmount, token))
    .then((charge) => {
      return pasync.each(songs, (songId) => {
        return voter.vote(name, email, songId, charge.id);
      });
    })
    .then(() => {
      res.send('Successfully Voted');
    })
    .catch(err => res.send(new errors.InternalServerError({
      statusCode: 500,
      message: JSON.stringify(err)
    })))
    .then(() => next());
});

server.listen(8080, () => {
  console.log('%s listening at %s', server.name, server.url);
});
