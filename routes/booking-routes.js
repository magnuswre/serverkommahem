const express = require('express');
const router = express.Router();
const Travels = require('../dbHelpers');

// GET ALL BOOKINGS
router.get('/bookings', (req, res) => {
    Travels.getAllBookings()
        .then(bookings => {
            res.status(200).json(bookings);
        })
        .catch(error => res.status(500).json(error));
});

// GET ALL BOOKINGS FOR A SPECIFIC USER
router.get('/bookings/:user', async (req, res) => {
    const { user_id } = req.query;
    try {
        const bookings = await Travels.getAllBookingsForAnUser(user_id);
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json(error);
    }
});

// CREATE A NEW BOOKING
router.post('/booking', async (req, res) => {
    const { enddestination, traveldate, seats, arrivalTime, user_id, destinationId } = req.body;

    if (!enddestination || !traveldate || !seats || !arrivalTime || !user_id || !destinationId) {
        return res.status(400).json({ message: 'Please provide enddestination, traveldate, seats, arrivalTime, user_id, and destinationId' });
    }

    try {
        const destination = await Travels.getDestinationById(destinationId);

        if (!destination || destination.seats < seats) {
            res.status(400).json({ message: 'Invalid destination or not enough available seats' });
        } else {
            const booking = {
                enddestination,
                traveldate,
                seats,
                arrivalTime,
                destinationId,
                user_id
            };

            const newBooking = await Travels.createBooking(booking);

            // Update the seats in the destination
            await Travels.updateDestinationSeats(destination.id, destination.seats - seats);

            res.status(201).json(newBooking);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});


// DELETE A BOOKING
router.delete('/booking/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const booking = await Travels.getBookingById(id);

        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
        } else {
            await Travels.deleteBooking(id);
            res.status(200).json({ message: 'Booking deleted' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

module.exports = router;  