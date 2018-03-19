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
  'user',
  'text',
  'tags',
  'food',
  'service',
  'ambience',
  'value',
  'averagerating',
  'wouldrecommendtofriend',
  'restaurant',
  'helpfulcount',
  'dinedon',
];

const userColumn = [
  'name',
  'isvip',
  'avatar',
];

const restaurantColumn = [
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
