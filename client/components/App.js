import React from 'react';
import ReactDOM from 'react-dom';
import Reviews from './Reviews.js';
import '../sass/main.scss';

// ReactDOM.render(<Reviews />, document.getElementById('app'));

// window.Reviews = Reviews;

Reviews.defaultProps = {
  isLoading: false,
};

export default Reviews;
