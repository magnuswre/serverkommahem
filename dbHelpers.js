// const knex = require('knex');
// const config = require('./knexfile'); 
// const db = knex(config.development); // db = './data/travel.sqlite3'in Knexfile.js

const db = require('./dbConfig');

// USERS

function getAllUsers() {
    return db('users').orderBy('id', 'desc'); // SELECT * FROM users ORDER BY id DESC;
}

async function addUser(user) {
    return db('users').insert(user, ['id', 'email', 'phone']); // INSERT INTO users VALUES (user); RETURNING id, email, phone;
}

function findUserByEmail(email) {
    return db('users').where({ email:email }).first(); // SELECT * FROM users WHERE email = email 
}   

function upDateUser(id, newUser) {
    return db('users')
    .where({ id:id })
    .update(newUser); // UPDATE destinations SET changes WHERE id = id;
}

function removeUser(id) {
    return db('users').where({ id:id }).del(); // DELETE FROM users WHERE id = id; (returns 1 if deleted, -1 if not)
}   
function findUserById(id) {
    return db('users').where({ id:id }).first(); // SELECT * FROM users WHERE id = id;
}

// JOINS Frontend can use this to get all destinations for an user

function getUserDestinations(user_id) {
    return db('users')
    .join('destinations', 'users.id', 'destinations.user_id')
    .select(
        'users.id as UserId', // alias 
        'users.phone as UserPhone', // alias
        'destinations.id as DestinationId', 
        'destinations.enddestination as EndDestination',
        'destinations.traveldate as DestinationTravelDate', // added
        'destinations.seats as DestinationSeats' // added
    )
    .where({ user_id:user_id });
}


// DESTINATIONS

function getAllDestinations() {
    return db('destinations').orderBy('id', 'desc'); // SELECT * FROM destinations ORDER BY id DESC;
}

async function addDestination(newDestination) {
    await db('destinations')
    .where({ user_id: newDestination.user_id })
    .insert(newDestination, ['id']); // 
}

function removeDestination(id) {
    return db('destinations')
    .where({ id:id })
    .del(); // DELETE FROM destinations WHERE id = id; (returns 1 if deleted, -1 if not)
}   

function upDateDestination(id, newDestination) {
    return db('destinations')
    .where({ id:id })
    .update(newDestination); // UPDATE destinations SET changes WHERE id = id;
}

// function getCurrentDate() {
//     return new Date();
// }

// function getDestinationByDate(traveldate) {
//     return db('destinations')
//         .where({ traveldate })
//         .orderBy('traveldate', 'asc');
// }


function getDestinationsByDate(travelDate) {
    if (!travelDate) {
        // If no travelDate is provided, default to current date
        travelDate = getCurrentDate();
    }
    
    return db('destinations')
        .where('traveldate', travelDate)
        .orderBy('traveldate', 'asc');
}

// GROUPING

function groupDestinations() {
    return db('destinations')
      .count()
      .groupBy('enddestination')
      .select('destinations.id', 'destinations.enddestination');
  }

module.exports = {
    getAllUsers,
    addUser,
    findUserByEmail,
    removeUser,
    getAllDestinations,
    findUserById,
    addDestination,
    removeDestination,
    upDateDestination,
    getUserDestinations,
    groupDestinations,
    upDateUser,
    getDestinationsByDate

}