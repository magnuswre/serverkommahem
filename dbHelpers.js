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
    return db('users').where({ email: email }).first(); // SELECT * FROM users WHERE email = email 
}

function upDateUser(id, newUser) {
    return db('users')
        .where({ id: id })
        .update(newUser); // UPDATE destinations SET changes WHERE id = id;
}

function removeUser(id) {
    return db('users').where({ id: id }).del(); // DELETE FROM users WHERE id = id; (returns 1 if deleted, -1 if not)
}
function findUserById(id) {
    return db('users').where({ id: id }).first(); // SELECT * FROM users WHERE id = id;
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
        .where({ user_id: user_id });
}


// DESTINATIONS

// function getAllDestinations() {
//     return db('destinations').orderBy('id', 'desc'); // SELECT * FROM destinations ORDER BY id DESC;
// }

async function getAllDestinationsWithUserDetails() {
    return db('destinations')
        .join('users', 'destinations.user_id', 'users.id')
        .select(
            'destinations.*',
            'users.email as userEmail',
            'users.phone as userPhone'
        )
        .orderBy('destinations.id', 'desc');
}

async function addDestination(newDestination) {
    await db('destinations')
        .where({ user_id: newDestination.user_id })
        .insert(newDestination, ['id']); // 
}

function removeDestination(id) {
    return db('destinations')
        .where({ id: id })
        .del(); // DELETE FROM destinations WHERE id = id; (returns 1 if deleted, -1 if not)
}

function upDateDestination(id, newDestination) {
    return db('destinations')
        .where({ id: id })
        .update(newDestination); // UPDATE destinations SET changes WHERE id = id;
}


function getDestinationsByDate(travelDate) {
    if (!travelDate) {
        // If no travelDate is provided, default to current date
        travelDate = getCurrentDate();
    }

    return db('destinations')
        .where('traveldate', travelDate)
        .orderBy('traveldate', 'asc');
}

function getDestinationById(id) {
    return db('destinations').where({ id: id }).first(); // SELECT * FROM destinations WHERE id = id;
}
// GROUPING

function groupDestinations() {
    return db('destinations')
        .select('enddestination')
        .count('enddestination as count')
        .groupBy('enddestination')
        .debug();
}

// function getDestinationsByDateNameSeatsAndArrivalTime(traveldate, enddestination, seats, arrivalTime) {
//     return db('destinations')
//         .where('traveldate', traveldate)
//         .andWhere('enddestination', 'like', `%${enddestination}%`)
//         .andWhere('seats', '>=', seats)
//         .andWhere('arrivalTime', arrivalTime)
//         .orderBy('traveldate', 'asc');
// }

// async function getDestinationsByDateNameSeatsAndArrivalTime(traveldate, enddestination, seats, arrivalTime) {
//     return db('destinations')
//         .where('traveldate', traveldate)
//         .andWhere('enddestination', 'like', `%${enddestination}%`)
//         .andWhere('seats', '>=', seats)
//         .andWhere('arrivalTime', arrivalTime)
//         .orderBy('traveldate', 'asc');
// }

async function getDestinationsByDateNameSeatsAndRoute(traveldate, enddestination, seats, arrival_time, departure_time, route) {
    return db('destinations')
        .join('users', 'destinations.user_id', '=', 'users.id')
        .select('destinations.*', 'users.email as userEmail', 'users.phone as userPhone')
        .where('traveldate', traveldate)
        .andWhere('enddestination', 'like', `%${enddestination}%`)
        .andWhere('seats', '>=', seats)
        .andWhere('arrival_time', arrival_time)
        .andWhere('departure_time', departure_time)
        .andWhere('route', route)
        .orderBy('traveldate', 'asc');
}

async function getRoutesByDateAndDestination(date, destination) {
    const arrivalTimes = await db('destinations')
        .where('traveldate', date)
        .andWhere('enddestination', 'like', `%${destination}%`)
        .select('id', 'traveldate as date', 'arrival_time', 'departure_time', 'route')
        .orderBy('arrival_time', 'asc');
    return arrivalTimes.filter((arrivalTime, index, self) => index === self.findIndex((t) => (
        t.arrival_time === arrivalTime.arrival_time
    )));
}

async function createBooking(booking) {
    const [id] = await db('bookings').insert(booking).returning('id');
    return db('bookings').where({ id }).first();
}

async function getAllBookingsForAnUser(user_id) {
    return db('bookings')
        .join('users as passenger', 'bookings.user_id', '=', 'passenger.id')
        .join('destinations', 'bookings.destinationId', '=', 'destinations.id')
        .join('users as driver', 'destinations.user_id', '=', 'driver.id')
        .select(
            'bookings.*',
            'passenger.email as passengerEmail',
            'passenger.phone as passengerPhone',
            'driver.email as driverEmail',
            'driver.phone as driverPhone',
            'destinations.enddestination',
            'destinations.traveldate',
            'bookings.seats',
            'destinations.arrivalTime'
        )
        .where('bookings.user_id', user_id)
        .orderBy('bookings.id', 'desc');
}

async function getAllBookings() {
    return db('bookings')
        .join('users as passenger', 'bookings.user_id', '=', 'passenger.id')
        .join('destinations', 'bookings.destinationId', '=', 'destinations.id')
        .join('users as driver', 'destinations.user_id', '=', 'driver.id')
        .select(
            'bookings.*',
            'passenger.email as passengerEmail',
            'passenger.phone as passengerPhone',
            'driver.email as driverEmail',
            'driver.phone as driverPhone',
            'destinations.enddestination',
            'destinations.traveldate',
            'bookings.seats',
            'destinations.arrival_time'
        )
        .orderBy('bookings.id', 'desc');
}

async function getBookingById(id) {
    return db('bookings').where({ id }).first();
}

async function updateBooking(id, changes) {
    return db('bookings')
        .where({ id })
        .update(changes);
}

async function deleteBooking(id) {
    return db('bookings').where({ id }).del();
}

async function addTimetable(timetable) {
    return db('timetable').insert(timetable);
}

async function getTimetable() {
    return db('timetable').orderBy('date', 'asc');
}

async function getTimetableByDate(date) {
    return db('timetable').where({ date });
}

function updateDestinationSeats(id, newSeats) {
    return db('destinations')
        .where({ id })
        .update({ seats: newSeats });
}
module.exports = {
    getAllUsers,
    addUser,
    findUserByEmail,
    removeUser,
    findUserById,
    addDestination,
    removeDestination,
    upDateDestination,
    getUserDestinations,
    groupDestinations,
    upDateUser,
    getDestinationsByDate,
    // getDestinationsByDateNameSeatsAndArrivalTime,
    getRoutesByDateAndDestination,
    createBooking,
    getAllBookings,
    getAllBookingsForAnUser,
    getAllDestinationsWithUserDetails,
    getBookingById,
    deleteBooking,
    addTimetable,
    getTimetable,
    getTimetableByDate,
    updateDestinationSeats,
    getDestinationById,
    updateBooking,
    getDestinationsByDateNameSeatsAndRoute


}