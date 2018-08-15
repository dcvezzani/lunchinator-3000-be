// const uuidv1 = require('uuid/v1');
// uuidv1();

exports.up = function(knex) {
  return knex.schema.createTable("ballots", function(t) {
    t.text("guid").primary();
    t.integer("winning_restaurant_id");
    t.datetime("end_time");
    t.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("ballots");
};
