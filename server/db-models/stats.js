const chance = new require('chance')(); // for normally distributed numbers
const _ = require('ramda');



function ratingDistribution(acc, rating) {
  // console.log(rating, acc);
  var bucket = Math.max(rating.food, rating.service, rating.ambience, rating.value);
  acc[bucket] += 1;

  return acc;
}

const findStats = (restaurant, reviews) => {
    const totalStatsArr = _.reduce((acc, review) => {
      return [ratingDistribution(acc[0], review.rating), {
        food: acc[1].food + review.rating.food,
        service: acc[1].service + review.rating.service,
        ambience: acc[1].ambience + review.rating.ambience,
        value: acc[1].value + review.rating.value,
        recommends: acc[1].recommends + Number(review.wouldRecommendToFriend)
      }];
    }, [{ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, { food: 0, service: 0, ambience: 0, value: 0, recommends: 0 }], reviews);
    const dist = totalStatsArr[0];
    const totalStats = totalStatsArr[1];
    return {
        totalRatingsScore: totalStats.food + totalStats.service + totalStats.ambience + totalStats.value,
        totalRatings: reviews.length,
        averageRating: {
          food: totalStats.food / reviews.length,
          service: totalStats.service / reviews.length,
          ambience: totalStats.ambience / reviews.length,
          value: totalStats.value / reviews.length
        },
        recommendationPercentage: totalStats.recommends / reviews.length,
        noise: chance.normal({ mean: 0, dev: 1 }),
        restaurant: reviews[0].restaurant,
        ratingsDistribution: dist
      }
};

module.exports = {
  findStats: findStats
};
