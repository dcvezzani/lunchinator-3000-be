// const uuidv1 = require('uuid/v1');
// uuidv1();

exports.up = function(knex) {
  return knex.schema.createTable("votes", function(t) {
    t.increments("id").primary();
    t.text("ballot_id");
    t.integer("restaurant_id");
    t.string("name");
    t.text("email_address");
    t.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("votes");
};
