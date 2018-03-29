import * as _ from 'ramda';
import axios from 'axios';


const preloadImage = (image) => {
  let img = new Image();
  img.src = image;
}

const preloadImages = (images) => {
  _.forEach((image) => {
    preloadImage(image);
  }, images);
}

class Node {
  constructor(value){
    this.value = value;
    this.right = null;
    this.left  = null;
  }

  setRight(ref){
    this.right = ref;
  }

  setLeft(ref){
    this.left = ref;
  }
}

class DoublyLinkedList {
  constructor(){
    this.head = null;
    this.tail = null;
  }

  addToHead(value){
    if (this.head === null){
      this.head = new Node(value);
      this.tail = this.head;
    } else {
      const node = new Node(value);
      node.setRight(this.head);
      this.head.setLeft(node);
      this.head = node;
    }
  }

  addToTail(value){
    if (this.tail === null){
      this.tail = new Node(value);
      this.head = this.tail;
    } else {
      const node = new Node(value);
      node.setLeft(this.tail);
      this.tail.setRight(node);
      this.tail = node;
    }

    return this.tail;
  }

  moveToTail(node){
    const left  = node.left;
    const right = node.right;
    if (left !== null ){ left.setRight(right); }
    if (right !== null){ right.setLeft(left); }

    node.setLeft(this.tail);
    node.setRight(null);
    this.tail = node;
  }

  removeHead(){
    if (this.head === null){ return; }
    const old_head = this.head;
    const node = this.head.right;
    this.head = node;
    node.setLeft(null);

    return old_head;
  }

  removeTail(){
    if (this.tail === null){ return; }
    const node = this.tail.left;
    this.tail = node;
    node.setRight(null);
  }
}

class JSONCache {
  constructor(limit = -1){
    this.cache = {};
    this.ll    = new DoublyLinkedList();
    this.size  = 0;
    this.limit = limit;
  }

  add(url){
    return axios.get(url).then((response) => {
      // Possible if the value was cached async
      if (this.cache[url]){ return Promise.resolve({...this.cache[url].value, cached: true }); }
      const data = response.data;
      this.size++;

      while (this.size > this.limit){
        this.ll.removeHead();
        this.size--;
      }

      const node = this.ll.addToTail(data);
      this.cache[url] = node;
      return Promise.resolve({...data, cached: false });
    }).catch((err) => {
      console.log("Could not retrieve.");
    });
  }

  fetch(url){
    if (this.cache[url] !== undefined){
      this.ll.moveToTail(this.cache[url]);
      return Promise.resolve({...this.cache[url].value, cached: true });
    } else {
      return this.add(url);
    }
  }
}

export { JSONCache, preloadImages };