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


async function removeUserDriver(id) {
    try {
        return db('users').where({ id: id }).del();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

function findUserById(id) {
    return db('users').where({ id: id }).first(); // SELECT * FROM users WHERE id = id;
}

async function removeUserPassenger(id) {
    try {
        // First, get all the user's bookings
        const bookings = await db('bookings').where({ user_id: id });

        // For each booking, add the number of booked seats back to the destination
        for (let booking of bookings) {
            // Only add the seats back if the booking is not cancelled
            if (booking.status !== 'cancelled') {
                const destination = await db('destinations').where({ id: booking.destinationId }).first();
                if (destination) {
                    const newSeats = destination.seats + booking.seats;
                    await db('destinations').where({ id: booking.destinationId }).update({ seats: newSeats });
                }
            }
        }

        // Delete the user's bookings
        await db('bookings').where({ user_id: id }).del();

        // Then, delete the user
        return db('users').where({ id: id }).del();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// FIND USER BY ID
function findUserById(id) {
    return db('users').where({ id: id }).first();
}

function getUserDestinations(user_id) {
    return db('users')
        .join('destinations', 'users.id', 'destinations.user_id')
        .select(
            'users.id as UserId',
            'users.phone as UserPhone',
            'destinations.id as DestinationId',
            'destinations.enddestination as EndDestination',
            'destinations.traveldate as DestinationTravelDate',
            'destinations.seats as DestinationSeats',
            'destinations.original_seats as OriginalSeats',
            'destinations.arrival_time as ArrivalTime',
            'destinations.departure_time as DepartureTime',
            'destinations.route as Route',
            'destinations.price as Price',
            'destinations.created_at as CreatedAt',
            'destinations.updated_at as UpdatedAt',
            'destinations.user_id as UserId',
            'users.email as userEmail',
            'users.phone as userPhone'
        )
        .where({ user_id: user_id });
}


// DESTINATIONS

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
        .del();
}

function upDateDestination(id, newDestination) {
    return db('destinations')
        .where({ id: id })
        .update(newDestination);
}


function getDestinationsByDate(travelDate) {
    if (!travelDate) {
        travelDate = getCurrentDate();
    }

    return db('destinations')
        .where('traveldate', travelDate)
        .orderBy('traveldate', 'asc');
}

function getDestinationById(id) {
    return db('destinations').where({ id: id }).first();
}
// GROUPING

function groupDestinations() {
    return db('destinations')
        .select('enddestination')
        .count('enddestination as count')
        .groupBy('enddestination')
        .debug();
}

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
        .andWhere('seats', '>', 0)
        .select('id', 'traveldate as date', 'arrival_time', 'departure_time', 'route')
        .orderBy('arrival_time', 'asc');
    return arrivalTimes.filter((arrivalTime, index, self) => index === self.findIndex((t) => (
        t.arrival_time === arrivalTime.arrival_time
    )));
}

async function createBooking(booking) {
    const [result] = await db('bookings').insert(booking).returning('id');
    const id = result.id;  // Extract the `id` from the returned object
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
            'destinations.arrival_time',
            'destinations.price',
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
            'destinations.arrival_time',
            'destinations.price',
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

async function removeTimeTableItem(id) {
    return db('timetable')
        .where({ id })
        .del();
}


function getBookingsForDestination(destinationId) {
    return db('bookings')
        .join('users', 'bookings.user_id', 'users.id')
        .select('bookings.*', 'users.email', 'users.phone')
        .where('bookings.destinationId', destinationId);
}


module.exports = {
    getAllUsers,
    addUser,
    findUserByEmail,
    findUserById,
    addDestination,
    removeDestination,
    upDateDestination,
    getUserDestinations,
    groupDestinations,
    upDateUser,
    getDestinationsByDate,
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
    getDestinationsByDateNameSeatsAndRoute,
    removeTimeTableItem,
    removeUserPassenger,
    removeUserDriver,
    getBookingsForDestination
}