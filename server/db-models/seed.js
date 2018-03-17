const _ = require('ramda');
const scriptArgs = _.map((arg) => parseInt(arg), process.argv.slice(3));

const DB_NAME = process.argv[2];
const NUM_RES = scriptArgs[0];
const NUM_USR = scriptArgs[1];
const NUM_REV = scriptArgs[2];
const NUM_BATCH = 10000;

console.log(DB_NAME);

const faker = require('faker');
const chance = new require('chance')(); // for normally distributed numbers
const pgp = require('pg-promise')();
const Models = require('./tables.js');
const START_TIME = new Date();

const db = pgp('postgres://localhost:5432/reviews');

async function seedDB() {
  for (let i = 0; i < NUM_RES; i += NUM_BATCH) {
    let saveUsers, saveRestaurants;

    async function insertMany(table, schema, data) {
      const promise = new Promise(function(resolve, reject) {
        const cs = new pgp.helpers.ColumnSet(schema, {table: table});
        db.tx('massive-insert', t => {
          return t.sequence(index => {
            const insert = pgp.helpers.insert(data, cs);
            return t.none(insert);
          });
        });
      });
      await promise;
    }

    async function seedUsers() {
        let createdUsers = _.range(0, NUM_USR).map(() => {
          return Models.userModel({
            name: faker.name.findName(),
            isVIP: faker.random.boolean(),
            avatar: faker.image.avatar()
          });
        });
        await insertMany('users', Models.userSchema, createdUsers);
        return createdUsers;
    }

    async function seedRestraunts() {
      let createdRestaurants = _.range(i, i + NUM_BATCH).map(() => {
        return Models.restaurantModel({
          name: faker.random.words(2),
          locations: _.map(() => faker.address.city() , _.range(0, Math.max(1, Math.round(chance.normal({ mean: 2 , dev: 1 })))))
        });
      });
      await insertMany('restaurants', Models.restaurantSchema, createdRestaurants);
      return createdRestaurants;
    }

    await Promise.all([
      seedUsers().then(result => saveUsers = result),
      seedRestraunts().then(result => saveRestaurants = result)
    ]);
    console.log(`seeded ${i + NUM_BATCH} Restraunts and ${NUM_USR} Users in ${(new Date() - START_TIME) / 60000} minutes`);

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
    await insertMany('reviews', Models.reviewsSchema, reviewModels);
  }
}
seedDB().then((reviews) => {
  console.log(`saved around ${NUM_REV} reviews for each restaurant`);
  console.log(`finished in ${(new Date() - START_TIME) / 60000} minutes`);
  process.exit();
}).catch((err) => {
  throw err;
});
