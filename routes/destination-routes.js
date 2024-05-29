const express = require('express');
const router = express.Router();
const Travels = require('../dbHelpers');

// // GET ALL DESTINATIONS

// router.get('/destinations/all', (req, res) => {
//    Travels.getAllDestinations()
//       .then(destinations => {
//          res.status(200).json(destinations);
//       })
//       .catch(error => res.status(500).json(error))
// })

// GET ALL DESTINATIONS WITH USER DETAILS
router.get('/destinations/all', (req, res) => {
   Travels.getAllDestinationsWithUserDetails()
      .then(destinations => {
         res.status(200).json(destinations);
      })
      .catch(error => res.status(500).json(error));
});

// CREATE A NEW DESTINATION

router.post('/users/:id/destinations', (req, res) => {
   const { id } = req.params;
   const newDestination = req.body;
   newDestination['user_id'] = id; // add user_id to newDestination object
   console.log(newDestination)

   Travels.findUserById(id)
      .then(user => {
         if (!user) {
            res.status(404).json({ message: 'User not found' })
         } else {
            if (!newDestination.enddestination || !newDestination.traveldate || !newDestination.seats) {
               res.status(400).json({ message: 'Please provide title and description' })
            } else {
               Travels.addDestination(newDestination)
                  .then(destination => {
                     res.status(200).json(destination);

                  })
                  .catch(error => res.status(500).json(error))
            }
         }
      })
      .catch(error => res.status(500).json(error))
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

// // GET DESTINATION BY CHOSEN DATE

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


// GET DESTINATIONS BY DATE, NAME, SEATS AND ARRIVAL TIME
router.get('/destinations/:traveldate/:enddestination/:seats/:arrivalTime', (req, res) => {
   const { traveldate, enddestination, seats, arrivalTime } = req.params;

   Travels.getDestinationsByDateNameSeatsAndArrivalTime(traveldate, enddestination, seats, arrivalTime)
      .then(destinations => {
         if (!destinations || destinations.length === 0) {
            res.status(404).json({ message: 'No destinations found for this date, enddestination, seats and arrival time' });
         } else {
            const matchingDestinations = destinations.filter(d =>
               d.enddestination.toLowerCase() === enddestination.toLowerCase() &&
               d.seats >= seats &&
               d.arrivalTime === arrivalTime
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

// GET ARRIVAL TIMES BY DATE AND DESTINATION
router.get('/arrivalTimes/:date/:destination', (req, res) => {
   const { date, destination } = req.params;

   Travels.getArrivalTimesByDateAndDestination(date, destination)
      .then(arrivalTimes => {
         if (!arrivalTimes || arrivalTimes.length === 0) {
            res.status(404).json({ message: 'No arrival times found for this date and destination' });
         } else {
            res.status(200).json(arrivalTimes);
         }
      })
      .catch(error => {
         console.error(error);
         res.status(500).json({ message: 'Internal server error', error: error.message });
      });
});



module.exports = router;