
const express = require('express');
const router = express.Router();
const Travels = require('../dbHelpers');
const bcrypt = require('bcryptjs');


// GET ALL USERS
router.get('/users', (req, res) => {
    Travels.getAllUsers()
       .then(users => {
          res.status(200).json(users);
       })
       .catch(error => res.status(500).json(error))
 });
 
 // CREATE A NEW USER
 router.post('/users/register', (req, res) => {
    const credentials = req.body;
 
    if (!credentials.email && credentials.password) {
       res.status(400).json({ message: 'Please provide email and password' })
    }
 
    const hash = bcrypt.hashSync(credentials.password, 12)
    credentials.password = hash;
 
    Travels.addUser(credentials)
       .then(user => {
          res.status(200).json(user);
       })
       .catch(error => {
          if(error.errno === 19) {
             res.status(400).json({ message: 'account with that email already exists' })
          } else {
             res.status(500).json(error)
          }
       })
 });
 
 // GET USER BY EMAIL
 
 router.get('/users/:email', (req, res) => {
    const { email } = req.params;
 
    Travels.findUserByEmail(email)
       .then(user => {
          res.status(200).json(user);
       })
       .catch(error => res.status(500).json(error))
 
 });

  // CHANGE A USER
 
  router.patch('/users/:id', (req, res) => {
   const { id } = req.params;

   Travels.upDateUser(id, req.body)
      .then(user => {
         res.status(200).json({ message: 'User updated' });
      })
      .catch(error => res.status(500).json(error))
});
 
 // DELETE AN USER
 
 router.delete('/users/:id', (req, res) => {
    const { id } = req.params;
 
    Travels.removeUser(id)
       .then(count => {
          if (count > 0) {
             res.status(200).json({ message: 'User deleted' });
          } else {
             res.status(404).json({ message: 'User not found (with that id)' });
          }
       })
       .catch(error => res.status(500).json(error))
 });
 
 
 // LOGIN WITH AN EXISTING USER
 
 router.post('/users/login', (req, res) => {
    const { email, password } = req.body;
 
    Travels.findUserByEmail(email, password)
       .then(user => {
          if (user && bcrypt.compareSync(password, user.password)) {
             res.status(200).json(user)
          } else {
             res.status(401).json({ message: 'User with that password does not exist' })
          }
       })
       .catch(error => res.status(500).json(error))
 })
 
 // JOINS
 router.get('/users/:id/destinations', (req, res) => { // get all destinations for a user
    const { id } = req.params;
 
    Travels.getUserDestinations(id)
       .then(destinations => {
          res.status(200).json(destinations);
       })
       .catch(error => res.status(500).json(error))
 })
 
 module.exports = router;   