/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', tbl => {
    tbl.increments(); // primary key, called 'id' and make it auto-increment
    tbl.text('email', 120).notNullable().unique().index();  
    tbl.text('password', 200).notNullable(); // 200 is the max length
    tbl.text('phone', 128).notNullable(); // 128 is the max length
    tbl.timestamps(true, true); // adds created_at and updated_at columns
  })
  .createTable('destinations', tbl => {
    tbl.increments();
    tbl.text('enddestination').notNullable().index();
    tbl.text('traveldate').notNullable();
    tbl.text('arrivalTime').notNullable();
    tbl.text('seats').notNullable();
    tbl.timestamps(true, true);     
    tbl.integer('user_id')
      .notNullable()
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE') // CASCADE, RESTRICT, DO NOTHING, SET NULL
      .onUpdate('CASCADE');
  })
};


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('destinations').dropTableIfExists('users');
};