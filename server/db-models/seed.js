const _ = require('ramda');
const path = require('path');
const scriptArgs = _.map((arg) => parseInt(arg), process.argv.slice(3));

const DB_NAME = process.argv[2];
const NUM_RES = scriptArgs[0];
const NUM_USR = scriptArgs[1];
const NUM_REV = scriptArgs[2];

console.log(DB_NAME);

const faker = require('faker');
const chance = new require('chance')(); // for normally distributed numbers
const pgp = require('pg-promise')();
const ColumnSet = require('./columnSet.js');
const dataGenerator = require('./dataGenerator.js');
const QueryFile = pgp.QueryFile;
const START_TIME = new Date();

const sql = (file) => {
  const filePath = path.join(__dirname, file);
  console.log(filePath)
  return new QueryFile(filePath, { minify: true });
};

const schema = sql('/create_schema.sql');
const table = sql('/create_table.sql');
const tableName = [{ table: 'users'}, { table: 'restraunts'}, { table: 'reviews'}];

const createTable = async() => {
  let db = pgp({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'JamesPowers',
  });
  await db.none(schema);
  db.$pool.end;
  db = pgp({
    host: 'localhost',
    port: 5432,
    database: DB_NAME,
    user: 'JamesPowers',
  });
  return db.none(table).then(() => db);
}

const getNextData = (t, pageIndex, rowFunc, batchSize) => {
  let data = null;
  if (pageIndex < 1000) {
    data = new Array(batchSize);
    for (let i = 0; i < batchSize; i++) {
      data[i] = rowFunc(NUM_USR, NUM_RES);
    }
  }
  return Promise.resolve(data);
};

const doMassiveInsert = (db, rowFunc, batchSize, cs) => {
  db.tx('massive-insert', t => {
    return t.sequence(index => {
      return getNextData(t, index, rowFunc, batchSize)
        .then(data => {
          if (data) {
            const insert = pgp.helpers.insert(data, cs);
            return t.none(insert);
          }
        });
    });
  })
    .catch(error => {
      // ROLLBACK has been executed
      console.log(error);
      reject(error);
    });
};

async function seedDB() {
  const db = await createTable();
  const csUsers = new pgp.helpers.ColumnSet(ColumnSet.userColumn, tableName[0]);
  const csRestraunts = new pgp.helpers.ColumnSet(ColumnSet.restaurantColumn, tableName[1]);
  const csReviews = new pgp.helpers.ColumnSet(ColumnSet.reviewsColumn, tableName[2]);

  await Promise.all([
    //seed users
    doMassiveInsert(db, dataGenerator.createUser(), NUM_USR / 1000, csUsers),
    //seed restraunts
    doMassiveInsert(db, dataGenerator.createRestraunts(), NUM_RES / 1000, csRestraunts)
  ]);
    console.log(`seeded ${NUM_RES} Restraunts and ${NUM_USR} Users in ${(new Date() - START_TIME) / 60000} minutes`);
    //seed reviews
    await doMassiveInsert(db, dataGenerator.createReviews(), NUM_REV / 1000, csReviews);
  }
}
seedDB().then((reviews) => {
  console.log(`saved around ${NUM_REV} reviews for each restaurant`);
  console.log(`finished in ${(new Date() - START_TIME) / 60000} minutes`);
  process.exit();
}).catch((err) => {
  throw err;
});
