import React, { Component } from 'react';
import Utilities from './Utilities.js';
import Stars from './Stars.js';


const Distribution = ({ ratings }) => {
  const percentages = Utilities.ratingsPercentages(ratings);

  return <div className="ratings-distribution">
    <div className="five-container">
      <span className="number">5</span>
      <div className="five">
        <div className="bar" style={{ width: percentages[5] + '%' }}></div>
      </div>
    </div>
    <div className="four-container">
      <span className="number">4</span>
      <div className="four">
        <div className="bar" style={{ width: percentages[4] + '%' }}></div>
      </div>
    </div>
    <div className="three-container">
      <span className="number">3</span>
      <div className="three">
        <div className="bar" style={{ width: percentages[3] + '%' }}></div>
      </div>
    </div>
    <div className="two-container">
      <span className="number">2</span>
      <div className="two">
        <div className="bar" style={{ width: percentages[2] + '%' }}></div>
      </div>
    </div>
    <div className="one-container">
      <span className="number">1</span>
      <div className="one">
        <div className="bar" style={{ width: percentages[1] + '%' }}></div>
      </div>
    </div>
  </div>;
}

const Noise = ({ noise }) => {
  var noiseLevel = 0;
  if (noise < 0.3){
    noiseLevel = 'Quiet';
  } else if (noise < 0.6){
    noiseLevel = 'Moderate';
  } else {
    noiseLevel = 'Loud';
  }

  return <div className="noise"><i className="bars"></i> <span className="bold">Noise</span> &middot; {noiseLevel}</div>
}

const Stats = ({ stats }) => (
  <div className="stats">
    <h1>What {stats.totalRatings} People Are Saying</h1>
    <div className="overall">
      <h3>Overall ratings and reviews</h3>
      <p>Reviews can only be made by diners who have eaten at this restaurant</p>
      <div className="overall-star-rating-container">
        <Stars stars={Utilities.starRating(stats.averageRating)} />&nbsp; 
        <div className="tagline bold">{Utilities.roundRating(Utilities.starRating(stats.averageRating))} based on recent ratings</div>
      </div>
      <div className="breakdown">
        <div className="rating food">
          <span className="number">{ Utilities.roundRating(stats.averageRating.food) }</span><br />
          <span className="cat">Food</span>
        </div>
        <div className="rating service">
          <span className="number">{ Utilities.roundRating(stats.averageRating.service) }</span><br />
          <span className="cat">Service</span>
        </div>
        <div className="rating ambience">
          <span className="number">{ Utilities.roundRating(stats.averageRating.ambience) }</span><br />
          <span className="cat">Ambience</span>
        </div>
        <div className="rating value">
          <span className="number">{ Utilities.roundRating(stats.averageRating.value) }</span><br />
          <span className="cat">Value</span>
        </div>
      </div>
      <Noise noise={stats.noise} />
      <div className="recommends"><i className="thumb"></i> 
        <span className="bold">{Math.round(stats.recommendationPercentage*100)}% of people</span> would recommend this place to a friend.
      </div>
    </div>
    <div className="distribution">
      <Distribution ratings={stats.ratingsDistribution} />
    </div>
  </div>
);

export default Stats;