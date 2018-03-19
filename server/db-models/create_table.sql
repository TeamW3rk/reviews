CREATE TABLE users (
  name TEXT,
  isvip BOOLEAN,
  avatar TEXT
);

CREATE TABLE restaurants(
  name TEXT,
  locations TEXT[]
);

CREATE TABLE reviews (
  user INT,
  text TEXT,
  tags TEXT,
  food INT,
  service INT,
  ambience INT,
  value INT,
  averagerating INT,
  wouldrecommendtofriend BOOLEAN
  restaurant INT,
  helpfulcount INT,
  dinedon DATE
);
