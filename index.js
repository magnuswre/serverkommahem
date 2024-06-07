require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const cors = require('cors');
app.use(cors({ origin: '*' }));
const nodemailer = require('nodemailer');

// IMPORT ROUTES
const usersRouter = require('./routes/user-routes');
const destinationsRouter = require('./routes/destination-routes');
const timetableRouter = require('./routes/timetable-routes');
const bookingsRouter = require('./routes/booking-routes');

function sendEmail({ recipient_email, OTP, type }) {
   return new Promise((resolve, reject) => {
      var transporter = nodemailer.createTransport({
         service: 'gmail',
         auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
         }
      });

      let mail_configs;

      if (type === 'password_reset') {
         mail_configs = {
            from: process.env.EMAIL_USER,
            to: recipient_email,
            subject: "Återställning lösenord Kommahem",
            html: `<!DOCTYPE html>
            <html lang="en">
             <head>
                <meta charset="UTF-8">
                <title>Återställning lösenord Kommahem</title>
              </head>
             <body>
             <!-- partial:index.partial.html -->
               <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                <div style="margin:50px auto;width:70%;padding:20px 0">
                 <div style="border-bottom:1px solid #eee">
                  <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Kommahem.se</a>
                 </div>
       
                <p>Use the following OTP to complete your Password Recovery Procedure.</p>
                <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
                <p style="font-size:0.9em;">Kommahem.se</p>
                <hr style="border:none;border-top:1px solid #eee" />
                <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                <p>Kommahem.se</p>
               </div>
             </div>
          </div>
         <!-- partial -->
       </body>
   </html>`
         };
      } else if (type === 'booking_confirmation') {
         mail_configs = {
            from: process.env.EMAIL_USER,
            to: recipient_email,
            subject: "Booking Confirmation Kommahem",
            html: `<!DOCTYPE html>
            <html lang="en">
             <head>
                <meta charset="UTF-8">
                <title>Booking Confirmation Kommahem</title>
              </head>
             <body>
             <!-- partial:index.partial.html -->
               <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                <div style="margin:50px auto;width:70%;padding:20px 0">
                 <div style="border-bottom:1px solid #eee">
                  <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Kommahem.se</a>
                 </div>
       
                <p>Your booking has been confirmed. Here are the details of your booking:</p>
                <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">Booking Details</h2>
                <p style="font-size:0.9em;">Kommahem.se</p>
                <hr style="border:none;border-top:1px solid #eee" />
                <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                <p>Kommahem.se</p>
               </div>
             </div>
          </div>
         <!-- partial -->
       </body>
   </html>`
         };
      }

      transporter.sendMail(mail_configs, function (error, info) {
         if (error) {
            console.log(error);
            reject({ message: `An error has occured` });
         } else {
            console.log('Email sent: ' + info.response);
            resolve({ message: `Email sent` });
         }
      });
   });
}

// ACTIVE (USE) ROUTES

app.get("/", (req, res) => {
   console.log(process.env.MY_EMAIL);
   res.json({ message: 'Welcome to server' });
});

app.post("/send_recovery_email", (req, res) => {
   sendEmail({ ...req.body, type: 'password_reset' })
      .then((response) => res.json({ message: response.message }))
      .catch((error) => res.status(500).json({ error: error.message }));
});

app.post("/send_booking_confirmation", (req, res) => {
   sendEmail({ ...req.body, type: 'booking_confirmation' })
      .then((response) => res.json({ message: response.message }))
      .catch((error) => res.status(500).json({ error: error.message }));
});

app.use('/', usersRouter);
app.use('/', destinationsRouter);
app.use('/', timetableRouter);
app.use('/', bookingsRouter);

// WELCOME PAGE
// app.get('/', (req, res) => {
//    res.json({ message: 'Welcome to server' })
// });

app.listen(port, () => {
   console.log(`Server running on port http://localhost:${port}`);
});
