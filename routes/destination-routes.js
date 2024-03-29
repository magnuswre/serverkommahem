const auth = require('../authentication/auth');

const express = require('express');
const router = express.Router();
const Travels = require('../dbHelpers');

// GET ALL DESTINATIONS

router.get('/destinations', (req, res) => {
    Travels.getAllDestinations()
       .then(destinations => {
          res.status(200).json(destinations);
       })
       .catch(error => res.status(500).json(error))
 })
 
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

 router.get('/destinations/:traveldate', (req, res) => {
   const { traveldate } = req.params;
   console.log(traveldate);

   Travels.getDestinationByDate(traveldate)
      .then(destination => {
         res.status(200).json(destination);
      })
      .catch(error => res.status(500).json(error));
});


 
 // GROUPING BY DESTINATIONS (GET ALL DESTINATIONS WITH THE SAME NAME)
 
 router.get('/destinationNumbers/', (req, res) => {
    Travels.groupDestinations()
       .then(destination => {
          res.status(200).json(destination);
       })
       .catch(error => res.status(500).json(error))
 })

module.exports = router;