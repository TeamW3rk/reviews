import axios from 'axios';
import * as _ from 'ramda';
import { preloadImages } from './CacheUtil.js';
import config from './config.client.js';

const ROOT_PATH = config.HOST + ':' + config.PORT;

// Specific Review Cache Manager

class ReviewCache {
  constructor(worker){
    this.worker = worker;
    this.promises = {};

    this.worker.addEventListener('message', (event) => {
      const e = event.data;
      const data = e.data;
      const url = e.url;
      const resolve = this.promises[url][0];
      // this.promises[url] = undefined; // clear promise after fulfillment
      resolve(data);
    });
  }

  makeSearchString(filters){
    const activeFilters = _.filter((filter) => {
      return filter === true;
    }, filters);

    const filterWords = Object.keys(activeFilters);

    if (!filterWords || filterWords.length === 0){ return ""; }
    return filterWords.join(',');
  }

  generateGetURL(rid, sortBy, page, pageLength, filters = {}){
    const words = this.makeSearchString(filters);
    const url = ROOT_PATH + `/${sortBy}/${rid}/${page}/${pageLength}/${words}`;

    return url;
  }

  prefetchSortPages(rid, page, pageLength, filters = {}){
    const newestURL = this.generateGetURL(rid, 'newest', page, pageLength, filters);
    const lowestURL = this.generateGetURL(rid, 'lowest', page, pageLength, filters);
    const highestURL = this.generateGetURL(rid, 'highest', page, pageLength, filters);

    Promise.all([
      this.fetch(newestURL),
      this.fetch(lowestURL),
      this.fetch(highestURL)
    ]).then((_) => {
      console.log('Finished prefetching');
    });
  }

  registerPromise(url, resolve, reject){
    this.promises[url] = [resolve, reject];
  }

  wait(url){
    return new Promise((resolve, reject) => {
      this.registerPromise(url, resolve, reject);
    });
  }

  fetch(url){
    this.worker.postMessage({ action: 'fetch', url: url });
    return this.wait(url).then((data) => {
      const cached = data.cached;
      const json = data.json;
      const reviews = json.reviews;
      if (cached === false){
        const images = _.map((review) => review.user.avatar, reviews);
        preloadImages(images);
      }

      return Promise.resolve(data.json);
    });
  }
}

export default ReviewCache;