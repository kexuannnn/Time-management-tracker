const express = require('express');
const timetableController = require('../controllers/timetableController');
const auth = require('../middleware/auth');

const router = express.Router();

// Timetable CRUD
router.post('/create', auth, timetableController.createTimetable);
router.get('/', auth, timetableController.getTimetable);
router.post('/generate', auth, timetableController.generateTimetable);

// Subject management
router.post('/subjects', auth, timetableController.addSubject);
router.delete('/subjects/:subjectId', auth, timetableController.deleteSubject);

// Activity management
router.post('/activities', auth, timetableController.addActivity);
router.delete('/activities/:activityId', auth, timetableController.deleteActivity);

// Timetable entries
router.put('/entries/:entryId', auth, timetableController.updateTimetableEntry);
router.delete('/entries/:entryId', auth, timetableController.deleteTimetableEntry);

module.exports = router;
