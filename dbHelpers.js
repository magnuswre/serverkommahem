// const knex = require('knex');
// const config = require('./knexfile'); 
// const db = knex(config.development); // db = './data/travel.sqlite3'in Knexfile.js

const db = require('./dbConfig');

// USERS

function getAllUsers() {
    return db('users').orderBy('id', 'desc'); // SELECT * FROM users ORDER BY id DESC;
}

async function addUser(user) {
    // await db('users').insert(user); // INSERT INTO users VALUES (user);
    // return db('users').where({ username: user.username }); // SELECT * FROM users WHERE username = user.username;

    return db('users').insert(user, ['id', 'username']); // INSERT INTO users VALUES (user); RETURNING id, username;
}

function findUserByUsername(username) {
    return db('users').where({ username:username }).first(); // SELECT * FROM users WHERE username = username 
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
        'users.imageUrl as UserImage', // alias
        'destinations.id as DestinationId', 
        'destinations.title as DestinationTitle',
        'destinations.description as DestinationDescription', // added
        'destinations.imageUrl as DestinationImage' // added
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

// GROUPING

function groupDestinations() {
  return db('destinations').count() // SELECT COUNT(*) FROM destinations;
  .groupBy('title') // SELECT * FROM destinations GROUP BY title;
  .select(
    'destinations.id', 
    'destinations.title', 
  )
}

module.exports = {
    getAllUsers,
    addUser,
    findUserByUsername,
    removeUser,
    getAllDestinations,
    findUserById,
    addDestination,
    removeDestination,
    upDateDestination,
    getUserDestinations,
    groupDestinations,
    upDateUser

}