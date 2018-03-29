// require('newrelic'); //for stress testing
const _ = require('ramda');
const Chance = require('chance');
const chance = new Chance();
const express = require('express');
const path = require('path');
const DB_NAME = 'reviewservices';
const Stats = require('./db-models/stats');
const ObjectID = require('mongodb').ObjectID;
const redis = require('redis');
const REDIS_PORT = 6379;

const runServer = async () => {
  const MongoClient = require('mongodb').MongoClient;
  const Client = await MongoClient.connect(`mongodb://localhost/${DB_NAME}`);
  const mdb = Client.db(DB_NAME);
  const Models = require('./db-models/models.js');
  const redisClient = redis.createClient(REDIS_PORT);


  const app = express();


  app.use(express.static(path.join(__dirname, '../public')));
  // For catching promise errors
  const amw = (fn) => {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  const redisCache = (req, res, next) => {
    const org = req.params.id;
    redisClient.get(org, function (err, data) {
      if (err) throw err;
      if (data != null) {
        res.send(JSON.parse(data));
      } else {
        next();
      }
    });
  }

  const redisNewestCache = (req, res, next) => {
    let org = '';
    if (parseInt(req.params.page, 10) === 1 && !req.params.search) {
      org = `newest${req.params.rid}`;
    }
    redisClient.get(org, function (err, data) {
      if (err) throw err;
      if (data != null) {
        res.send(JSON.parse(data));
      } else {
        next();
      }
    });
  }


  // Helper for MongoDB searches
  function createSearchString(searchString){
    if (!searchString || searchString.length === 0){ return ""; }
    const words = searchString.split(',');
    const andWords = _.map((word) => '\"' + word + '\"', words);
    return andWords.join(' ');

  }

  const getReviews = async (rid, page, page_length, sortOptions, search) => {
    page        = parseInt(page);
    page_length = parseInt(page_length);
    search      = createSearchString(search);
    if (search === undefined || search.length === 0){
      var reviews = await mdb.collection('Review')
        .find({ restaurant: ObjectID(rid) })
        .sort(sortOptions)
        .skip((page - 1)*page_length)
        .limit(page_length)
        .toArray();
      var totalReviews = await mdb.collection('Review')
        .find({ restaurant: ObjectID(rid) })
        .count();
    } else {
      var reviews = await mdb.collection('Review')
        .find({ restaurant: ObjectID(rid), $text: { $search: search } })
        .sort(sortOptions)
        .skip((page - 1)*page_length)
        .limit(page_length)
        .toArray();

      var totalReviews = await mdb.collection('Review')
        .find({ restaurant: ObjectID(rid), $text: { $search: search } })
        .count();
    }

    const reviewsUsers = await Promise.all(_.map(async (review) => {
      const reviewClone = _.clone(review);
      const user = await mdb.collection('User').findOne({ _id: review.user });
      return {...reviewClone, user: user };
    }, reviews));

    return { reviews: reviewsUsers, totalReviews: totalReviews };
  }

  const router = express.Router();
  router.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });

  router.get('/summary', amw(async (req, res, next) => {
    // const restaurants  = await mdb.collection('Restaurant').find({ restID: 10 }).toArray();
    const restaurants  = await mdb.collection('Restaurant').find().limit(5).toArray();
    const restaurant   = chance.pickone(restaurants);
    const allReviews = await mdb.collection('Review').find({ restaurant: restaurant._id }).toArray();
    const totalReviews = allReviews.length;
    const stats = Stats.findStats(restaurant, allReviews);
    const dist  = stats.ratingsDistribution;
    const statsDist = {...stats, ratingsDistribution: dist };
    res.send({ stats: 'ok', json: { stats: statsDist, totalReviews: totalReviews }});
  }));

  router.get('/summary/:id', redisCache, amw(async (req, res, next) => {
    const restaurant  = await mdb.collection('Restaurant').find({ restID: parseInt(req.params.id, 10) }).toArray();
    const allReviews = await mdb.collection('Review').find({ restaurant: restaurant[0]._id }).toArray();
    const totalReviews = allReviews.length;
    const stats = Stats.findStats(restaurant, allReviews);
    const dist  = stats.ratingsDistribution;
    const statsDist = {...stats, ratingsDistribution: dist };
    const result = { stats: 'ok', json: { stats: statsDist, totalReviews: totalReviews }};
    redisClient.setex(req.params.id, 3600, JSON.stringify(result));
    res.send(result);
  }));

  router.get('/newest/:rid/:page/:page_length/:search?', redisNewestCache, amw(async (req, res) => {
    const params  = req.params;
    const reviews = await getReviews(params.rid, params.page, params.page_length, { dinedOn: -1 }, params.search);
    if (parseInt(params.page, 10) === 1 && !params.search) {
      redisClient.setex(`newest${params.rid}`, 36000, JSON.stringify({ status: 'ok', json: reviews }));
    }
    res.send({ status: 'ok', json: reviews });
  }));

  router.get('/highest/:rid/:page/:page_length/:search?', amw(async (req, res, next) => {
    const params  = req.params;
    const reviews = await getReviews(params.rid, params.page, params.page_length, { averageRating: -1 }, params.search);
    res.send({ status: 'ok', json: reviews });
  }));

  router.get('/lowest/:rid/:page/:page_length/:search?', amw(async (req, res, next) => {
    const params  = req.params;
    const reviews = await getReviews(params.rid, params.page, params.page_length, { averageRating: 1 }, params.search);
    res.send({ status: 'ok', json: reviews });
  }));

  app.use('/', router);
  const server = app.listen(4004);

  module.exports = {
    app: app,
    server: server,
    mongoose: MongoClient//mongoose
  };
}

runServer();
