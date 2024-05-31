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
    const { user } = req.params;
    try {
        const bookings = await Travels.getAllBookingsForAnUser(user);
        res.status(200).json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
});

// CREATE A NEW BOOKING
router.post('/booking/create', async (req, res) => {
    const {
        enddestination,
        traveldate,
        seats,
        arrival_time,
        departure_time,
        route,
        user_id,
        destinationId
    } = req.body;

    if (!enddestination || !traveldate || !seats || !arrival_time || !departure_time || !route || !user_id || !destinationId) {
        return res.status(400).json({ message: 'Please provide enddestination, traveldate, seats, arrival_time, departure_time, route, user_id, and destinationId' });
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
                arrival_time,
                departure_time,
                route,
                destinationId,
                user_id,
                status: 'active'
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


// CANCEL/TOGGLE A BOOKING

router.put('/booking/cancel/:id', async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body; // The user_id should be sent in the request body

    try {
        const booking = await Travels.getBookingById(id);

        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
        } else if (booking.user_id !== user_id) {
            res.status(403).json({ message: 'You are not authorized to cancel this booking' });
        } else {
            // Toggle the booking status
            const newStatus = booking.status === 'active' ? 'cancelled' : 'active';
            await Travels.updateBooking(id, { status: newStatus });

            // If the booking was cancelled, add the seats back to the destination
            // If the booking was activated, subtract the seats from the destination
            const destination = await Travels.getDestinationById(booking.destinationId);
            const seatsChange = newStatus === 'cancelled' ? booking.seats : -booking.seats;
            await Travels.updateDestinationSeats(destination.id, destination.seats + seatsChange);

            res.status(200).json({ message: `Booking ${newStatus}` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// UPDATE A BOOKING

router.put('/booking/update/:id', async (req, res) => {
    const { id } = req.params;
    const { user_id, seats } = req.body;

    try {
        const booking = await Travels.getBookingById(id);

        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
        } else if (booking.user_id !== user_id) {
            res.status(403).json({ message: 'You are not authorized to update this booking' });
        } else if (booking.status === 'cancelled') {
            res.status(400).json({ message: 'Booking is not active' });
        } else {
            // Perform the update
            const updatedBooking = await Travels.updateBooking(id, { seats });
            res.status(200).json(updatedBooking);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// DELETE A BOOKING

router.delete('/booking/delete/:id', async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body; // The user_id should be sent in the request body

    try {
        const booking = await Travels.getBookingById(id);

        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
        } else if (booking.user_id !== user_id) {
            res.status(403).json({ message: 'You are not authorized to delete this booking' });
        } else {
            // Delete the booking
            await Travels.deleteBooking(id);

            // Update the number of seats in the destination
            const destination = await Travels.getDestinationById(booking.destinationId);
            await Travels.updateDestinationSeats(destination.id, destination.seats + booking.seats);

            res.status(200).json({ message: 'Booking deleted' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

module.exports = router;  