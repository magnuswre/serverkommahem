require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const cors = require('cors');
app.use(cors({ origin: '*' }));

// TEST

// IMPORT ROUTES
const usersRouter = require('./routes/user-routes');
const destinationsRouter = require('./routes/destination-routes');
const timetableRouter = require('./routes/timetable-routes');
const bookingsRouter = require('./routes/booking-routes');

// ACTIVE (USE) ROUTES
app.use('/', usersRouter);
app.use('/', destinationsRouter);
app.use('/', timetableRouter);
app.use('/', bookingsRouter);

// WELCOME PAGE
app.get('/', (req, res) => {
   res.json({ message: 'Welcome to server' })
});

app.listen(port, () => {
   console.log(`Server running on port http://localhost:${port}`);
});