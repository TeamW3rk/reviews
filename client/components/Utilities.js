import * as _ from 'ramda';

const roundRating = (rating) => (Math.round(rating*10)/10).toFixed(1);
const generateStars = (stars) => {
  var nearestHalfStar = Math.round(stars*2) / 2;
  var remainingStars = 5 - nearestHalfStar;

  var starTypes = [];

  while (nearestHalfStar > 0){
    if (nearestHalfStar - 1 < 0){
      starTypes.push('half-star');
    } else {
      starTypes.push('star');
    }

    nearestHalfStar -= 1; 
  }

  while (remainingStars > 0){
    if (remainingStars - 1 < 0){
      remainingStars = 0;
      continue;
    } else {
      starTypes.push('grey-star');
    }

    remainingStars -= 1;
  }

  return starTypes;
};
const starRating = (rating) => {
  return Math.round((rating.food + rating.service + rating.ambience + rating.value) / 4);
};
const ratingsPercentages = (dist) => {
  const total = dist[5] + dist[4] + dist[3] + dist[2] + dist[1];

  return {
    1: (dist[1] / total)*100,
    2: (dist[2] / total)*100,
    3: (dist[3] / total)*100,
    4: (dist[4] / total)*100,
    5: (dist[5] / total)*100
  };
}
const dropdownText = (name) => {
  var text = "";
  if (name === 'newest'){
    text = "Newest";
  } else if (name === 'highest'){
    text = "Highest rating";
  } else {
    text = "Lowest rating";
  }

  return text;
}

const threePageWindow = (currentPage, lastPage) => {
  var showThesePages = null;

  if (lastPage <= 3){
    showThesePages = _.range(1, lastPage + 1);
  } else {
    if (currentPage === 1){
      showThesePages = _.range(1, Math.min(lastPage, currentPage + 2) + 1);
    } else if (currentPage === lastPage){
      showThesePages = _.range(Math.max(1, currentPage - 2), lastPage + 1);
    } else {
      showThesePages = _.range(Math.max(1, currentPage - 1), Math.min(lastPage, currentPage + 1) + 1);
    }
  }

  return showThesePages;
}

const Utilities = {
  roundRating: roundRating,
  generateStars: generateStars,
  starRating: starRating,
  ratingsPercentages: ratingsPercentages,
  dropdownText: dropdownText,
  threePageWindow: threePageWindow
};

export default Utilities;