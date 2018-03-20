const _ = require('ramda');
const Chance = require('chance');
const chance = new Chance();
const express = require('express');
const path = require('path');
const helper = require('./helper.js');

const DB_NAME = (process.env.TEST === 'true') ? 'testreviewservice' : 'reviewservice';

// const mongoose = require('mongoose');
// mongoose.connect(process.env.DB + DB_NAME);
const Models = require('./db-models/models.js');

const app = express();
app.use(express.static(path.join(__dirname, '../public')));

// For catching promise errors
const amw = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Helper for MongoDB searches
function createSearchString(searchString){
  if (!searchString || searchString.length === 0){ return ""; }
  const words = searchString.split(',');
  const andWords = _.map((word) => '\"' + word + '\"', words);
  return andWords.join(' ');

}

const getReviews = async (rid, page, page_length, sortOptions, search) => {
  // const rid         = rid;
  page        = parseInt(page);
  page_length = parseInt(page_length);
  search      = createSearchString(search);

  if (search === undefined || search.length === 0){
    var reviews = await Models.reviewsModel
      .find({ restaurant: rid })
      .sort(sortOptions)
      .skip((page - 1)*page_length)
      .limit(page_length);

    var totalReviews = await Models.reviewsModel
      .find({ restaurant: rid }).count();
  } else {
    var reviews = await Models.reviewsModel
      .find({ restaurant: rid, $text: { $search: search } })
      .sort(sortOptions)
      .skip((page - 1)*page_length)
      .limit(page_length);

    var totalReviews = await Models.reviewsModel
      .find({ restaurant: rid, $text: { $search: search } }).count();
  }

  const reviewsUsers = await Promise.all(_.map(async (review) => {
    const reviewClone = _.clone(review._doc);
    const user = await Models.userModel.findOne({ _id: review.user });

    return {...reviewClone, user: user._doc };
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
  const restaurants  = await Models.restaurantModel.find({}).limit(100);
  const restaurant   = chance.pickone(restaurants);
  const totalReviews = await Models.reviewsModel.find({ restaurant: restaurant._id }).count();
  const stats = await Models.statsModel.findOne({ restaurant: restaurant._id });
  helper.covertKeysToCamelCase(stats);
  const dist  = await Models.ratingsDistModel.findOne({ _id: stats.ratingsDistribution });
  helper.covertKeysToCamelCase(dist);
  const statsDist = {...stats._doc, ratingsDistribution: dist };

  res.send({ stats: 'ok', json: { stats: statsDist, totalReviews: totalReviews }});
}));

router.get('/newest/:rid/:page/:page_length/:search?', amw(async (req, res) => {
  const params  = req.params;
  const reviews = await getReviews(params.rid, params.page, params.page_length, { dinedOn: -1 }, params.search);

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
console.log('success!')
module.exports = {
  app: app,
  server: server,
  // mongoose: mongoose
};
