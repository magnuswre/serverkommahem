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
    tbl.text('first_name', 128);
    tbl.text('last_name', 128);
    tbl.date('date_of_birth');
    tbl.text('gender', 10);
    tbl.text('profile_picture');
    tbl.text('address', 120);
    tbl.text('city', 120);
    tbl.text('state', 120);
    tbl.text('country', 120);
    tbl.text('zip_code', 20);
    tbl.text('message');
    tbl.text('comment');
    tbl.text('role', 128).defaultTo('user');
    tbl.timestamps(true, true);
  })
    .createTable('destinations', tbl => {
      tbl.increments();
      tbl.text('enddestination').notNullable().index();
      tbl.text('traveldate').notNullable();
      tbl.time('arrival_time').notNullable();
      tbl.time('departure_time').notNullable();
      tbl.text('route').notNullable();
      tbl.integer('original_seats').notNullable();
      tbl.integer('seats').notNullable();
      tbl.integer('price').notNullable();
      tbl.text('status').defaultTo('active');
      tbl.text('message');
      tbl.text('comment');
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
      tbl.text('IDENT').notNullable();
      tbl.index(['date', 'arrival_time', 'departure_time', 'route', 'IDENT']);
    })
    .createTable('bookings', tbl => {
      tbl.increments();
      tbl.text('enddestination').notNullable();
      tbl.text('traveldate').notNullable();
      tbl.integer('seats').notNullable();
      tbl.time('arrival_time').notNullable();
      tbl.time('departure_time').notNullable();
      tbl.text('route').notNullable();
      tbl.text('message');
      tbl.text('comment');
      tbl.integer('destinationId').notNullable()
      tbl.integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
      tbl.text('status').notNullable().defaultTo('active');
      tbl.timestamps(true, true);
    });
};


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTableIfExists('bookings'),
    knex.schema.dropTableIfExists('destinations'),
    knex.schema.dropTableIfExists('timetable'),
    knex.schema.dropTableIfExists('users')
  ]);
};