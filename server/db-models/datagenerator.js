const faker = require('faker');
const chance = new require('chance')();
const _ = require('ramda');

const createUser = () => ({
  name: faker.name.findName(),
  isvip: faker.random.boolean(),
  avatar: faker.image.avatar(),
});

const createRestraunts = () => ({
  name: faker.random.words(2),
  locations: _.map(() => faker.address.city() , _.range(0, Math.max(1, Math.round(chance.normal({ mean: 2 , dev: 1 }))))),
});

const createReviews = (userNum, restaurantNum) => {
  let food = Math.min(5, Math.max(1, Math.round(chance.normal({ mean: 3, dev: 1 }))));
  let service = Math.min(5, Math.max(1, Math.round(chance.normal({ mean: 3, dev: 1 }))));
  let ambience = Math.min(5, Math.max(1, Math.round(chance.normal({ mean: 3, dev: 1 }))));
  let value = Math.min(5, Math.max(1, Math.round(chance.normal({ mean: 3, dev: 1 }))));
  let averagerating = (food + service + ambience + value) / 4;

  return {
    user: Math.floor(Math.random() * userNum),
    text: faker.lorem.paragraphs(),
    tags: _.map(() => faker.random.word(), _.range(0, Math.max(0, Math.round(chance.normal({ mean: 5 , dev: 2 }))))),
    food: food,
    service: service,
    ambience: ambience,
    value: value,
    averagerating: averagerating,
    wouldrecommendtofriend: faker.random.boolean(),
    restaurant: Math.floor(Math.random() * restaurantNum),
    helpfulcount: Math.max(0, Math.round(chance.normal({ mean: 1, dev: 1 }))),
    dinedon: faker.date.recent()
  }
};

module.exports.createUser = createUser;
module.exports.createReviews = createReviews;
module.exports.createRestraunts = createRestraunts;
