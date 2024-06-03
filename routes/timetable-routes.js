const express = require('express');
const router = express.Router();
const Travels = require('../dbHelpers');

// CREATE TIMETABLE

router.post('/timetable/create', (req, res) => {
   const timetable = req.body;
   Travels.addTimetable(timetable)
      .then(timetable => {
         res.status(201).json(timetable);
      })
      .catch(error => res.status(500).json(error))
});

// GET TIMETABLE

router.get('/timetable', (req, res) => {
   Travels.getTimetable()
      .then(timetable => {
         res.status(200).json(timetable);
      })
      .catch(error => res.status(500).json(error))
});

// GET TIMETABLE BY DATE

router.get('/timetable/:date', (req, res) => {
   const { date } = req.params;
   Travels.getTimetableByDate(date)
      .then(timetable => {
         res.status(200).json(timetable);
      })
      .catch(error => res.status(500).json(error))
});

// UPDATE TIMETABLEITEM
router.patch('/timetable/update/:id', (req, res) => {
   const { id } = req.params;
   Travels.updateTimeTableItem(id)
      .then(timetable => {
         res.status(200).json(timetable);
      })
      .catch(error => res.status(500).json(error))
});

// DELETE TIMETABLEITEM
router.delete('/timetable/delete/:id', (req, res) => {
   const { id } = req.params;
   Travels.removeTimeTableItem(id)
      .then(timetable => {
         res.status(200).json(timetable);
      })
      .catch(error => {
         console.error(error);
         res.status(500).json(error)
      });
});


module.exports = router;  