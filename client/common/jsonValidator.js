const Ajv = require('ajv');

const ajv = new Ajv();
module.exports = {
  validate: (data, schema) => ajv.compile(schema)(data),
};
