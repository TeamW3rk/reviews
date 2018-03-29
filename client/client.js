import Reviews from './components/App.js';
import ReactDOM from 'react-dom';
import React from 'react';
import axios from 'axios';

const element = document.getElementById('reviews');
const initState = JSON.parse(element.getAttribute('data-reviews'))

ReactDOM.hydrate(<Info {...initState}/>, element);
