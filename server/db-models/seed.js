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

async function seedDB() {
  let saveUsers, saveRestaurants;
  async function seedUsers() {
      let createdUsers = _.range(0, NUM_USR).map(() => {
        return Models.userModel({
          name: faker.name.findName(),
          isVIP: faker.random.boolean(),
          avatar: faker.image.avatar()
        });
      });
      await Models.userModel.insertMany(createdUsers);
      return createdUsers;
  }

  async function seedRestraunts() {
    let createdRestaurants = _.range(0, NUM_RES).map(() => {
      return Models.restaurantModel({
        name: faker.random.words(2),
        locations: _.map(() => faker.address.city() , _.range(0, Math.max(1, Math.round(chance.normal({ mean: 2 , dev: 1 })))))
      });
    });
    await Models.restaurantModel.insertMany(createdRestaurants);
    return createdRestaurants;
  }

  await Promise.all([
    seedUsers().then(result => saveUsers = result),
    seedRestraunts().then(result => saveRestaurants = result)
  ]);
  console.log(`seeded ${NUM_RES} Restraunts and ${NUM_USR} Users in ${(new Date() - START_TIME) / 60000} minutes`);

  var restaurants = saveRestaurants;
  var users = saveUsers;
  let reviewModels = restaurants.map((restaurant) => {
    var numReviews = Math.max(1, Math.round(chance.normal({ mean: NUM_REV, dev: Math.floor(NUM_REV / 2) })));

    return _.range(0, numReviews).map(() => {
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
    });
  });
  await Models.reviewsModel.insertMany(_.flatten(reviewModels));
}
const START_TIME = new Date();
seedDB().then((reviews) => {
  console.log(`saved around ${NUM_REV} reviews for each restaurant`);
  console.log(`finished in ${(new Date() - START_TIME) / 60000} minutes`);
  process.exit();
}).catch((err) => {
  throw err;
});
