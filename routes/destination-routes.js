const express = require('express');
const router = express.Router();
const Travels = require('../dbHelpers');

// GET ALL DESTINATIONS 

router.get('/destinations/all', (req, res) => {
   Travels.getAllDestinationsWithUserDetails()
      .then(destinations => {
         res.status(200).json(destinations);
      })
      .catch(error => res.status(500).json(error));
});

// GET DESTINATIONS BY USER ID
router.get('/users/:id/destinations', (req, res) => {
   const { id } = req.params;

   Travels.getUserDestinations(id)
      .then(destinations => {
         if (!destinations || destinations.length === 0) {
            res.status(404).json({ message: 'No destinations found for this user' });
         } else {
            res.status(200).json(destinations);
         }
      })
      .catch(error => {
         console.error(error);
         res.status(500).json({ message: 'Internal server error', error: error.message });
      });
});

// CREATE A NEW DESTINATION

router.post('/users/:id/destinations', (req, res) => {
   const { id } = req.params;
   const newDestination = req.body;
   newDestination['user_id'] = id; // add user_id to newDestination object

   console.log(newDestination);

   Travels.findUserById(id)
      .then(user => {
         if (!user) {
            res.status(404).json({ message: 'User not found' });
         } else {
            const requiredFields = ['enddestination', 'traveldate', 'seats', 'original_seats', 'price'];
            const missingFields = requiredFields.filter(field => !newDestination[field]);

            if (missingFields.length > 0) {
               res.status(400).json({ message: `Please provide ${missingFields.join(', ')}` });
            } else {
               Travels.addDestination(newDestination)
                  .then(destination => {
                     res.status(200).json(destination);
                  })
                  .catch(error => res.status(500).json({ error: 'Error adding destination', details: error }));
            }
         }
      })
      .catch(error => res.status(500).json({ error: 'Error finding user', details: error }));
});

// DELETE A DESTINATION

router.delete('/destinations/:id', (req, res) => {
   const { id } = req.params;

   Travels.removeDestination(id)
      .then(count => {
         if (count > 0) {
            res.status(200).json({ message: 'Destination deleted' });
         } else {
            res.status(404).json({ message: 'No Destination (with that id)' });
         }
      })
      .catch(error => res.status(500).json(error))
});

// CHANGE A DESTINATION

router.patch('/destinations/:id', (req, res) => {
   const { id } = req.params;

   Travels.upDateDestination(id, req.body)
      .then(destination => {
         res.status(200).json({ message: 'Destination updated' });
      })
      .catch(error => res.status(500).json(error))
});

// GET DESTINATION BY DATE

router.get('/destinations/:traveldate?', (req, res) => {
   const { traveldate } = req.params;

   // Check if a specific travel date is provided, otherwise default to current date
   const queryDate = traveldate ? traveldate : getCurrentDate();

   Travels.getDestinationsByDate(queryDate)
      .then(destination => {
         res.status(200).json(destination);
      })
      .catch(error => res.status(500).json(error));
});

// GET DESTINATION BY CHOSEN DATE

router.get('/destinations/chosen/:traveldate', (req, res) => {
   const { traveldate } = req.params;
   console.log(traveldate);

   Travels.getDestinationsByDate(traveldate)
      .then(destination => {
         if (!destination) {
            res.status(404).json({ message: 'No destination found for this date' });
         } else {
            res.status(200).json(destination);
         }
      })
      .catch(error => {
         console.error(error);
         res.status(500).json({ message: 'Internal server error', error: error.message });
      });
});



// GROUPING BY DESTINATIONS (GET ALL DESTINATIONS WITH THE SAME NAME)

router.get('/destinationsgrouping', (req, res) => {
   Travels.groupDestinations()
      .then(destination => {
         console.log(destination); // Log the result
         res.status(200).json(destination);
      })
      .catch(error => {
         console.log(error); // Log the error
         res.status(500).json(error)
      });
});


// GET DESTINATIONS BY DATE, NAME, SEATS AND ....
router.get('/destinations/:traveldate/:enddestination/:seats/:arrival_time/:departure_time/:route', (req, res) => {
   const { traveldate, enddestination, seats, arrival_time, departure_time, route } = req.params;

   Travels.getDestinationsByDateNameSeatsAndRoute(traveldate, enddestination, seats, arrival_time, departure_time, route)
      .then(destinations => {
         if (!destinations || destinations.length === 0) {
            res.status(404).json({ message: 'No destinations found for this date, enddestination, seats and arrival time' });
         } else {
            const matchingDestinations = destinations.filter(d =>
               d.enddestination.toLowerCase() === enddestination.toLowerCase() &&
               d.seats >= seats &&
               d.arrival_time === arrival_time
            );
            if (matchingDestinations.length === 0) {
               res.status(404).json({ message: 'No destinations with the provided enddestination, enough seats and arrival time found for this date' });
            } else {
               res.status(200).json(matchingDestinations);
            }
         }
      })
      .catch(error => {
         console.error(error);
         res.status(500).json({ message: 'Internal server error', error: error.message });
      });
});

// GET ROUTES TIMES BY DATE AND DESTINATION
router.get('/routes/:date/:destination', (req, res) => {
   const { date, destination } = req.params;

   Travels.getRoutesByDateAndDestination(date, destination)
      .then(routes => {
         if (!routes || routes.length === 0) {
            res.status(404).json({ message: 'No routes found for this date and destination' });
         } else {
            res.status(200).json(routes);
         }
      })
      .catch(error => {
         console.error(error);
         res.status(500).json({ message: 'Internal server error', error: error.message });
      });
});

// GET BOOKINGS FOR A SPECIFIC DESTINATION
router.get('/destinations/:id/bookings', (req, res) => {
   const { id } = req.params;

   Travels.getBookingsForDestination(id)
      .then(bookings => {
         if (!bookings || bookings.length === 0) {
            res.status(404).json({ message: 'No bookings found for this destination' });
         } else {
            res.status(200).json(bookings);
         }
      })
      .catch(error => {
         console.error(error);
         res.status(500).json({ message: 'Internal server error', error: error.message });
      });
});


module.exports = router;