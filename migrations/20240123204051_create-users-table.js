/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('users', tbl => {
    tbl.increments();
    tbl.text('email', 120).notNullable().unique().index();
    tbl.text('password', 200).notNullable();
    tbl.text('phone', 128).notNullable();
    tbl.timestamps(true, true);
  })
    .createTable('destinations', tbl => {
      tbl.increments();
      tbl.text('enddestination').notNullable().index();
      tbl.text('traveldate').notNullable();
      tbl.text('arrivalTime').notNullable();
      tbl.integer('seats').notNullable();
      tbl.timestamps(true, true);
      tbl.integer('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
    })
    .createTable('timetable', tbl => {
      tbl.increments('id');
      tbl.date('date').notNullable();
      tbl.time('arrival_time').notNullable();
      tbl.time('departure_time').notNullable();
      tbl.text('route').notNullable();
      tbl.integer('IDENT').notNullable();
      tbl.index(['date', 'arrival_time', 'departure_time', 'route', 'IDENT']);
    })
    .createTable('bookings', tbl => {
      tbl.increments();
      tbl.text('enddestination').notNullable();
      tbl.text('traveldate').notNullable();
      tbl.integer('seats').notNullable();
      tbl.text('arrivalTime').notNullable();
      tbl.integer('destinationId').notNullable()
      tbl.integer('user_id')
        .unsigned()
        .references('id')
        .inTable('destinations')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
      tbl.timestamps(true, true);
    });
};


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTableIfExists('destinations'),
    knex.schema.dropTableIfExists('users'),
    knex.schema.dropTableIfExists('timetable'),
    knex.schema.dropTableIfExists('bookings')
  ]);
};