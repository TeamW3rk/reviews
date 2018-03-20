CREATE TABLE users (
  userid INT,
  name TEXT,
  is_v_i_p BOOLEAN,
  avatar TEXT
);

CREATE TABLE restaurants (
  restrauntid INT,
  name TEXT,
  locations TEXT[]
);

CREATE TABLE reviews (
  reviewid INT,
  user INT,
  text TEXT,
  tags TEXT,
  food INT,
  service INT,
  ambience INT,
  value INT,
  average_rating INT,
  would_recommend_to_friend BOOLEAN,
  restaurant INT,
  helpful_count INT,
  dined_on DATE
);
