const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        default: 'My Timetable',
    },
    // Settings
    settings: {
        schoolStartTime: { type: String, default: '08:00' }, // HH:MM format
        schoolEndTime: { type: String, default: '16:00' },
        lessonsPerDay: { type: Number, default: 5 },
        breakTime: { type: Number, default: 15 }, // minutes
        lunchTime: { type: Number, default: 60 }, // minutes
        schoolDays: { type: [String], default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
        studyDuration: { type: Number, default: 60 }, // minutes (30, 60, 120, 180)
        studyTime: { type: String, default: 'Afternoon' }, // Morning, Afternoon, Evening
    },
    // Subjects
    subjects: [{
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        color: String,
        priority: { type: Number, default: 1 },
        hoursPerWeek: { type: Number, default: 3 },
    }],
    // Activities
    activities: [{
        _id: mongoose.Schema.Types.ObjectId,
        type: { type: String, enum: ['CCA', 'Work', 'Personal', 'Class'] },
        name: String,
        day: String,
        startTime: String,
        endTime: String,
        color: String,
        notes: String,
    }],
    // Generated Timetable Entries
    timetableEntries: [{
        _id: mongoose.Schema.Types.ObjectId,
        day: String,
        startTime: String,
        endTime: String,
        activity: String, // Subject or activity name
        type: { type: String, enum: ['Subject', 'Break', 'Lunch', 'CCA', 'Work', 'Personal'] },
        color: String,
        conflicts: [{ type: String }], // List of conflicting entries
    }],
    // Metadata
    isGenerated: { type: Boolean, default: false },
    conflicts: [{
        day: String,
        entry1: String,
        entry2: String,
        startTime: String,
        endTime: String,
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Timetable', TimetableSchema);
