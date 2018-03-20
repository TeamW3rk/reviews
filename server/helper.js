const camelCase = require('camelcase');

const covertKeysToCamelCase = (obj) => {
  const result = {};
  for(var key in obj) {
    result[camelCase(key)] = obj[key];
  }
  return result;
}

module.exports.covertKeysToCamelCase = covertKeysToCamelCase;
