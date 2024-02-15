exports.up = function(knex) {
    return knex.schema.table('users', function (table) {
      table.text('arrivalTime').notNullable();
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.table('users', function (table) {
      table.dropColumn('arrivalTime');
    });
  };