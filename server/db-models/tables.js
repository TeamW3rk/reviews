const ratingsDistributionSchema = [
  '1',
  '2',
  '3',
  '4',
  '5',
];

const statsSchema = [
  'totalRatingsScore',
  'totalRatings',
  'averageRating',
  'recommendationPercentage',
  'ratingsDistribution',
  'noise',
  'restaurant',
];

const reviewsSchema = [
  'user',
  'text',
  'tags',
  'averageRating',
  'rating',
  'wouldRecommendToFriend',
  'restaurant',
  'location',
  'helpfulCount',
  'dinedOn',
];

const userSchema = [
  'name',
  'isVIP',
  'avatar',
];

const restaurantSchema = [
  'name',
  'locations',
];

module.exports = {
  ratingsDistributionSchema: ratingsDistributionSchema,
  statsSchema: statsSchema,
  reviewsSchema: reviewsSchema,
  userSchema: userSchema,
  restaurantSchema: restaurantSchema,
};
