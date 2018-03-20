const ratingsDistributionColumn = [
  '1',
  '2',
  '3',
  '4',
  '5',
];

const statsColumn = [
  'totalRatingsScore',
  'totalRatings',
  'averageRating',
  'recommendationPercentage',
  'ratingsDistribution',
  'noise',
  'restaurant',
];

const reviewsColumn = [
  'reviewid',
  'user',
  'text',
  'tags',
  'food',
  'service',
  'ambience',
  'value',
  'average_rating',
  'would_recommend_to_friend',
  'restaurant',
  'helpful_count',
  'dined_on',
];

const userColumn = [
  'userid',
  'name',
  'is_v_i_p',
  'avatar',
];

const restaurantColumn = [
  'restrauntid',
  'name',
  'locations',
];

module.exports = {
  ratingsDistributionColumn: ratingsDistributionColumn,
  statsColumn: statsColumn,
  reviewsColumn: reviewsColumn,
  userColumn: userColumn,
  restaurantColumn: restaurantColumn,
};
