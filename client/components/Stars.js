import React, { Component } from 'react';
import Utilities from './Utilities.js';

const Star = ({ type }) => (
  <div className={type}></div>
);

class Stars extends Component {
  constructor(props){
    super(props);
  }

  render(){
    return <div className="stars-rating">
      {Utilities.generateStars(this.props.stars).map((star, idx) => {
        return <Star key={idx} type={star} />;
      })}
    </div>;
  }
}

export default Stars;