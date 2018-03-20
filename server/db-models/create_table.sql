CREATE TABLE users (
  userid INT,
  name TEXT,
  isvip BOOLEAN,
  avatar TEXT
);

CREATE TABLE restaurants (
  restrauntid INT,
  name TEXT,
  locations TEXT[]
);

CREATE TABLE reviews (
  reviewid INT,
  userid INT,
  texts TEXT,
  tags TEXT,
  food INT,
  service INT,
  ambience INT,
  value INT,
  averagerating INT,
  wouldrecommendtofriend BOOLEAN,
  restaurantid INT,
  helpfulcount INT,
  dinedon DATE
);
