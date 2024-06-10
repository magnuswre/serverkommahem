const express = require('express');
const router = express.Router();
const Travels = require('../dbHelpers');
const bcrypt = require('bcryptjs');
const auth = require('../authentication/auth');

// // SEND EMAIL

// router.get('/sendmail', (req, res) => {
//    sendEmail()
//       .then(response => res.send(response.message))
//       .catch(error => res.status(500).send(error.message))
// });



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
         const token = auth.generateTokenUser(user);
         return res.status(201).json({ token, user, message: 'User added successfully' });
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

// CHANGE PASSWORD

router.put('/user/:id/password', async (req, res) => {
   const { id } = req.params;
   const { currentPassword, newPassword } = req.body;

   try {
      const user = await Travels.findUserById(id);

      if (!user) {
         return res.status(404).json({ message: 'User not found' });
      }

      const passwordMatch = bcrypt.compareSync(currentPassword, user.password);

      if (!passwordMatch) {
         return res.status(401).json({ message: 'Current password is incorrect' });
      }

      const hash = bcrypt.hashSync(newPassword, 12);
      await Travels.upDateUser(id, { password: hash });

      res.status(200).json({ message: 'Password updated successfully' });
   } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
   }
});

router.put('/user/:id/reset_password', async (req, res) => {
   const { id } = req.params;
   const { newPassword } = req.body;

   try {
      const user = await Travels.findUserById(id);

      if (!user) {
         return res.status(404).json({ message: 'User not found' });
      }

      const hash = bcrypt.hashSync(newPassword, 12);
      await Travels.upDateUser(id, { password: hash });

      res.status(200).json({ message: 'Password updated successfully' });
   } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
   }
});

// GET USER BY EMAIL

// router.get('/users/:email', (req, res) => {
//    const { email } = req.params;

//    Travels.findUserByEmail(email)
//       .then(user => {
//          if (user) {
//             res.status(200).json(user);
//          } else {
//             res.status(200).json({ userExists: false });
//          }
//       })
//       .catch(error => res.status(500).json(error))
// });

// USER CHECK:

router.post('/users/check', (req, res) => {
   const { email } = req.body;

   Travels.findUserByEmail(email)
      .then(user => {
         if (user) {
            res.status(200).json({ userExists: true, userId: user.id });
         } else {
            res.status(200).json({ userExists: false });
         }
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

// DELETE AN USER DRIVER

router.delete('/usersdriver/:id', (req, res) => {
   const { id } = req.params;

   Travels.removeUserDriver(id)
      .then(count => {
         if (count > 0) {
            res.status(200).json({ message: 'User deleted' });
         } else {
            res.status(404).json({ message: 'User not found (with that id)' });
         }
      })
      .catch(error => res.status(500).json(error))
});

// DELETE AN USER PASSENGER

router.delete('/userspassenger/:id', (req, res) => {
   const { id } = req.params;

   Travels.removeUserPassenger(id)
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

router.post('/users/login', async (req, res) => {
   const { email, password } = req.body;

   try {
      const user = await Travels.findUserByEmail(email);

      if (user && bcrypt.compareSync(password, user.password)) {
         const token = auth.generateTokenUser(user);
         res.status(200).json({ token, user });
      } else {
         res.status(401).json({ message: 'Invalid email or password' });
      }
   } catch (error) {
      res.status(500).json(error);
   }
});

// LOGIN WITH AN EXISTING USER

// router.post('/users/login', async (req, res) => {
//    const { email, password } = req.body;

//    try {
//      // 1. Find user by email
//      const user = await Travels.findUserByEmail(email);

//      // 2. Check if user exists and password matches (using bcrypt)
//      if (!user || !bcrypt.compareSync(password, user.password)) {
//        return res.status(401).json({ message: 'Invalid email or password' });
//      }

//      // 3. Create JWT payload (including user ID and other relevant data)
//      const payload = {
//        userId: user.id,
//        // Add other relevant user information if needed (e.g., roles)
//      };

//      // 4. Sign the JWT using your secret key and set options (e.g., expiration time)
//      const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' }); // Change '1h' to your desired expiration
//      // 5. Send the JWT token back to the client
//      res.status(200).json({ token });
//    } catch (error) {
//      console.error(error);
//      res.status(500).json({ message: 'Internal server error' });
//    }
//  });


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