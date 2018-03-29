import { JSONCache } from './CacheUtil.js';

const cache = new JSONCache(24);

self.addEventListener('message', (msg) => {
  const e = msg.data;
  const action = e.action;
  const url = e.url;
  switch (action){
    case 'fetch':
      cache.fetch(url).then((data) => {
        self.postMessage({ url: url, data: data });
      }).catch((err) => {
        self.postMessage({ status: 'error' });
      });
    break;
    default:
    break;
  }
});