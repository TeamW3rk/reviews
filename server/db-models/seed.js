const _ = require('ramda');
const scriptArgs = _.map((arg) => parseInt(arg), process.argv.slice(3));

const DB_NAME = process.argv[2];
const NUM_RES = scriptArgs[0];
const NUM_USR = scriptArgs[1];
const NUM_REV = scriptArgs[2];
const NUM_HOLD = 1000;

console.log(DB_NAME);

const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/" + DB_NAME);
const faker = require('faker');
const chance = new require('chance')(); // for normally distributed numbers
const Models = require('./models.js');

let createdUsers = _.map(() => {
  return Models.userModel({
    name: faker.name.findName(),
    isVIP: faker.random.boolean(),
    avatar: faker.image.avatar()
  });
}, _.range(0, NUM_USR));

let saveUsers = Models.userModel.insertMany(createdUsers);
// async function processSeed() {

  // for (let i = 0; i < NUM_RES; i += NUM_HOLD) {
    let createdRestaurants = _.map(() => {
      return Models.restaurantModel({
        name: faker.random.words(2),
        locations: _.map(() => faker.address.city() , _.range(0, Math.max(1, Math.round(chance.normal({ mean: 2 , dev: 1 })))))
      });
    }, _.range(0, NUM_RES));


    // let saveRestaurants = Promise.all(_.map((model) => {
    //   return model.save();
    // }, createdRestaurants));
    let saveRestaurants = Models.restaurantModel.insertMany(createdRestaurants);
    // let saveUsers = Promise.all(_.map((model) => model.save(), createdUsers));

    Promise.all([saveRestaurants, saveUsers]).then((results) => {
      console.log('done generating ' + NUM_RES + ' restaurants and ' + NUM_USR + ' users');
        // process.exit();
    // }
      // for each restaurant generate a random number of reviews
      var restaurants = results[0];
      var users = results[1];

      // console.log(results.length, users.length, users.slice(0, 3));

      let reviewModels = _.map((restaurant) => {
        var numReviews = Math.max(1, Math.round(chance.normal({ mean: NUM_REV, dev: Math.floor(NUM_REV / 2) })));

        return _.map(() => {
          var user = chance.pickone(users);
          var rating = {
            food: Math.min(5, Math.max(1, Math.round(chance.normal({ mean: 3, dev: 1 })))),
            service: Math.min(5, Math.max(1, Math.round(chance.normal({ mean: 3, dev: 1 })))),
            ambience: Math.min(5, Math.max(1, Math.round(chance.normal({ mean: 3, dev: 1 })))),
            value: Math.min(5, Math.max(1, Math.round(chance.normal({ mean: 3, dev: 1 }))))
          };
          var averageRating = (rating.food + rating.service + rating.ambience + rating.value) / 4;

          return Models.reviewsModel({
            user: user._id,
            text: faker.lorem.paragraphs(),
            tags: _.map(() => faker.random.word(), _.range(0, Math.max(0, Math.round(chance.normal({ mean: 5 , dev: 2 }))))),
            averageRating: averageRating,
            rating: rating,
            wouldRecommendToFriend: faker.random.boolean(),
            restaurant: restaurant._id,
            location: chance.pickone(restaurant.locations),
            helpfulCount: Math.max(0, Math.round(chance.normal({ mean: 1, dev: 1 }))),
            dinedOn: faker.date.recent()
          });
        }, _.range(0, numReviews));
      }, restaurants);

      // console.log(reviewModels.slice(0, 5));

      // return Promise.all(_.map((model) => model.save(), _.flatten(reviewModels)));
      return Models.reviewsModel.insertMany(_.flatten(reviewModels));
    }).then((reviews) => {
      console.log('saved around ' + NUM_REV + ' reviews for each restaurant');
      process.exit();
    }).catch((err) => {
      throw err;
    });
  // }
// }
