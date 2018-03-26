const _ = require('ramda');
const scriptArgs = _.map((arg) => parseInt(arg), process.argv.slice(3));

const DB_NAME = process.argv[2];
const NUM_RES = scriptArgs[0];
const NUM_USR = scriptArgs[1];
const NUM_REV = scriptArgs[2];
const NUM_HOLD = 10000;

console.log(DB_NAME);


const MongoClient = require('mongodb').MongoClient;

const faker = require('faker');
const chance = new require('chance')(); // for normally distributed numbers
const Models = require('./models.js');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const START_TIME = new Date();
if (cluster.isMaster){
  console.log(`Master ${process.pid} is running`);
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} finished`);
  });
} else {
  seedDB().catch((err) => {
    throw err;
  });
  console.log(`Worker ${process.pid} started`);
}

async function seedDB() {
  const id = cluster.worker.id; // listed 1-8
  const Client = await MongoClient.connect(`mongodb://localhost/${DB_NAME}`);
  const mdb = Client.db(DB_NAME);
  const UserCollection = mdb.collection('User');
  const RestaurantCollection = mdb.collection('Restaurant');
  const ReviewCollection = mdb.collection('Review');
  const PART_USR = Math.floor(NUM_USR / numCPUs);
  const PART_RES = Math.floor(NUM_RES / numCPUs);

  async function seedUsers() {
    let createdUsers = _.range(0, PART_USR).map(() => {
      return Models.userModel({
        name: faker.name.findName(),
        isVIP: faker.random.boolean(),
        avatar: faker.image.avatar()
      });
    });
    await UserCollection.insertMany(createdUsers);
    return createdUsers;
  }

  async function seedRestraunts(i) {
    let createdRestaurants = _.range(i, i + NUM_HOLD).map((index) => {
      return Models.restaurantModel({
        restID: ((id - 1) * PART_RES) + index,
        name: faker.random.words(2),
        locations: _.map(() => faker.address.city() , _.range(0, Math.max(1, Math.round(chance.normal({ mean: 2 , dev: 1 })))))
      });
    });
    await RestaurantCollection.insertMany(createdRestaurants);
    return createdRestaurants;
  }

  for (let i = 0; i < PART_RES; i += NUM_HOLD) {
    let saveUsers, saveRestaurants;

    await Promise.all([
      seedUsers().then(result => saveUsers = result),
      seedRestraunts(i).then(result => saveRestaurants = result)
    ]);
    console.log(`seeded ${i + NUM_HOLD} Restraunts and ${PART_USR} Users in ${(new Date() - START_TIME) / 60000} minutes`);

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
    await ReviewCollection.insertMany(_.flatten(reviewModels));
  }
  Client.close();
  console.log(`saved around ${NUM_REV} reviews for each restaurant`);
  console.log(`finished in ${(new Date() - START_TIME) / 60000} minutes`);
  process.exit();
}
