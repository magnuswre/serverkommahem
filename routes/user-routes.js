
const express = require('express');
const router = express.Router();
const Travels = require('../dbHelpers');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const auth = require('../authentication/auth');

// GET ALL USERS
router.get('/users', (req, res) => {
   Travels.getAllUsers()
      .then(users => {
         res.status(200).json(users);
      })
      .catch(error => res.status(500).json(error))
});



// CREATE A USER
router.post('/users/register', async (req, res) => {
   try {
      const credentials = req.body;

      if (!credentials.email || !credentials.password) {
         return res.status(400).json({ message: 'Please provide email and password' });
      }

      const hash = bcrypt.hashSync(credentials.password, 12);
      credentials.password = hash;

      // Assuming addUser returns the inserted user
      const user = await Travels.addUser(credentials);

      if (user) {
         return res.status(201).json({ message: 'User added successfully' });
      } else {
         return res.status(500).json({ message: 'User was not added successfully' });
      }
   } catch (error) {
      if (error.errno === 19) {
         return res.status(400).json({ message: 'Account with that email already exists' });
      } else {
         return res.status(500).json(error);
      }
   }
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

// router.post('/users/login', (req, res) => {
//    const { email, password } = req.body;

//    Travels.findUserByEmail(email, password)
//       .then(user => {
//          if (user && bcrypt.compareSync(password, user.password)) {
//             res.status(200).json(user)
//          } else {
//             res.status(401).json({ message: 'User with that password does not exist' })
//          }
//       })
//       .catch(error => res.status(500).json(error))
// })

router.post('/users/login', async (req, res) => {
   const { email, password } = req.body;
 
   try {
     // 1. Find user by email
     const user = await Travels.findUserByEmail(email);
 
     // 2. Check if user exists and password matches (using bcrypt)
     if (!user || !bcrypt.compareSync(password, user.password)) {
       return res.status(401).json({ message: 'Invalid email or password' });
     }
 
     // 3. Create JWT payload (including user ID and other relevant data)
     const payload = {
       userId: user.id,
       // Add other relevant user information if needed (e.g., roles)
     };
 
     // 4. Sign the JWT using your secret key and set options (e.g., expiration time)
     const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' }); // Change '1h' to your desired expiration
 
     // 5. Send the JWT token back to the client
     res.status(200).json({ token });
   } catch (error) {
     console.error(error);
     res.status(500).json({ message: 'Internal server error' });
   }
 });



//  // GET DESTINATION BY DATE

//  router.get('/destinations/:traveldate', (req, res) => {
//    const { traveldate } = req.params;
//    console.log(traveldate);

//    Travels.getDestinationByDate(traveldate)
//       .then(destination => {
//          res.status(200).json(destination);
//       })
//       .catch(error => res.status(500).json(error));
// });

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