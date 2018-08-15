const config = require("../knexfile");
const knex = require("knex");
import changeCase from "change-case";
import _ from "lodash";

export const postProcessResponse = result => {
  // todo: only returning the last id for inserted record in a batch
  // todo: find better way of identifying result sets from inserts/updates/deletes
  // if (_.isArray(result) && result.length > 0 && result[0].toString().match(/^[0-9]+$/)) return {newIds: result};
  if (_.isArray(result)) return result.map(row => toCamel(row));
  return toCamel(result);
};

export const wrapIdentifier = (value, origImpl) => {
  if (value === "*") return origImpl(value);
  return origImpl(changeCase.snake(value));
};

const dbEnv = process.env.NODE_ENV || "development";
export const db = knex({
  ...config[dbEnv],
  postProcessResponse,
  wrapIdentifier
});

export const handleError = (err, resOrCallback) => {
  if (!err) return;
  console.error("Database error", { error: err.toString() });
  if (resOrCallback) {
    if (_.isFunction(resOrCallback)) return resOrCallback(err);
  }
};

db.handleError = handleError;

const toCamel = ob => {
  const newOb = {};
  _.forEach(ob, (val, key) => {
    newOb[changeCase.camel(key)] = val;
  });
  return newOb;
};

export default db;
