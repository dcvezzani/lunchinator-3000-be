// const uuidv1 = require('uuid/v1');
// uuidv1();

exports.up = function(knex) {
  return knex.schema.createTable("ballot_choices", function(t) {
    t.increments("id").primary();
    t.text("ballot_id");
    t.integer("restaurant_id");
    t.string("name");
    t.text("description");
    t.string("average_review");
    t.string("top_reviewer");
    t.text("review");
    t.boolean("is_suggested");
    t.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("ballot_choices");
};
