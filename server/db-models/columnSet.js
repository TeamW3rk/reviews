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
  'userid',
  'texts',
  'tags',
  'food',
  'service',
  'ambience',
  'value',
  'averagerating',
  'wouldrecommendtofriend',
  'restaurantid',
  'helpfulcount',
  'dinedon',
];

const userColumn = [
  'userid',
  'name',
  'isvip',
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
