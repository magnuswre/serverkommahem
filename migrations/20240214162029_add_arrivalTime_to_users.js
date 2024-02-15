/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // Add the new column "arrivalTime" to the "users" table
  return knex.schema.table('users', function (table) {
    table.text('arrivalTime').notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Remove the "arrivalTime" column from the "users" table
  return knex.schema.table('users', function (table) {
    table.dropColumn('arrivalTime');
  });
};