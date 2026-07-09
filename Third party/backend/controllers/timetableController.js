const Timetable = require('../models/Timetable');
const mongoose = require('mongoose');

// Convert time string to minutes
const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

// Convert minutes to time string
const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

// Check if two time slots overlap
const hasConflict = (start1, end1, start2, end2) => {
    const s1 = timeToMinutes(start1);
    const e1 = timeToMinutes(end1);
    const s2 = timeToMinutes(start2);
    const e2 = timeToMinutes(end2);
    
    return !(e1 <= s2 || e2 <= s1);
};

// Detect conflicts in timetable
const detectConflicts = (entries) => {
    const conflicts = [];
    
    for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
            const entry1 = entries[i];
            const entry2 = entries[j];
            
            if (entry1.day === entry2.day && hasConflict(entry1.startTime, entry1.endTime, entry2.startTime, entry2.endTime)) {
                conflicts.push({
                    day: entry1.day,
                    entry1: entry1.activity,
                    entry2: entry2.activity,
                    startTime: entry1.startTime,
                    endTime: Math.min(timeToMinutes(entry1.endTime), timeToMinutes(entry2.endTime)),
                });
            }
        }
    }
    
    return conflicts;
};

// Create or update timetable
exports.createTimetable = async (req, res) => {
    try {
        const { name, settings, subjects, activities } = req.body;
        
        let timetable = await Timetable.findOne({ userId: req.userId });
        
        if (timetable) {
            timetable.name = name || timetable.name;
            timetable.settings = { ...timetable.settings, ...settings };
            timetable.subjects = subjects || timetable.subjects;
            timetable.activities = activities || timetable.activities;
        } else {
            timetable = new Timetable({
                userId: req.userId,
                name: name || 'My Timetable',
                settings: settings || {},
                subjects: subjects || [],
                activities: activities || [],
            });
        }
        
        timetable.updatedAt = new Date();
        await timetable.save();
        
        res.status(201).json(timetable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user's timetable
exports.getTimetable = async (req, res) => {
    try {
        const timetable = await Timetable.findOne({ userId: req.userId });
        
        if (!timetable) {
            return res.status(404).json({ message: 'Timetable not found' });
        }
        
        res.json(timetable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Generate timetable
exports.generateTimetable = async (req, res) => {
    try {
        const timetable = await Timetable.findOne({ userId: req.userId });
        
        if (!timetable) {
            return res.status(404).json({ message: 'Timetable not found' });
        }
        
        const { settings, subjects, activities } = timetable;
        const entries = [];
        const schoolDays = settings.schoolDays;
        
        // Add school schedule and subjects
        for (const day of schoolDays) {
            let currentTime = timeToMinutes(settings.schoolStartTime);
            const schoolEndMinutes = timeToMinutes(settings.schoolEndTime);
            let lessonCount = 0;
            
            while (currentTime < schoolEndMinutes && lessonCount < settings.lessonsPerDay) {
                const nextLessonEnd = currentTime + 45; // 45 min lesson
                
                if (nextLessonEnd <= schoolEndMinutes) {
                    const subject = subjects[lessonCount % subjects.length];
                    entries.push({
                        _id: new mongoose.Types.ObjectId(),
                        day,
                        startTime: minutesToTime(currentTime),
                        endTime: minutesToTime(nextLessonEnd),
                        activity: subject.name,
                        type: 'Subject',
                        color: subject.color,
                        conflicts: [],
                    });
                }
                
                currentTime = nextLessonEnd;
                lessonCount++;
                
                // Add break
                if (lessonCount % 2 === 0 && currentTime < schoolEndMinutes) {
                    const breakEnd = currentTime + settings.breakTime;
                    entries.push({
                        _id: new mongoose.Types.ObjectId(),
                        day,
                        startTime: minutesToTime(currentTime),
                        endTime: minutesToTime(breakEnd),
                        activity: 'Break',
                        type: 'Break',
                        color: '#FFE5B4',
                        conflicts: [],
                    });
                    currentTime = breakEnd;
                }
                
                // Add lunch
                if (lessonCount === Math.floor(settings.lessonsPerDay / 2)) {
                    const lunchEnd = currentTime + settings.lunchTime;
                    entries.push({
                        _id: new mongoose.Types.ObjectId(),
                        day,
                        startTime: minutesToTime(currentTime),
                        endTime: minutesToTime(lunchEnd),
                        activity: 'Lunch',
                        type: 'Lunch',
                        color: '#FFA500',
                        conflicts: [],
                    });
                    currentTime = lunchEnd;
                }
            }
            
            // Add study sessions
            const studyStartMinutes = settings.studyTime === 'Morning' ? 600 :
                                     settings.studyTime === 'Afternoon' ? 1200 : 1800;
            
            if (studyStartMinutes < schoolEndMinutes) {
                entries.push({
                    _id: new mongoose.Types.ObjectId(),
                    day,
                    startTime: minutesToTime(studyStartMinutes),
                    endTime: minutesToTime(studyStartMinutes + settings.studyDuration),
                    activity: 'Study Time',
                    type: 'Subject',
                    color: '#87CEEB',
                    conflicts: [],
                });
            }
        }
        
        // Add custom activities
        for (const activity of activities) {
            entries.push({
                _id: new mongoose.Types.ObjectId(),
                day: activity.day,
                startTime: activity.startTime,
                endTime: activity.endTime,
                activity: activity.name,
                type: activity.type,
                color: activity.color,
                conflicts: [],
            });
        }
        
        // Detect conflicts
        const conflicts = detectConflicts(entries);
        
        // Mark conflicting entries
        for (const conflict of conflicts) {
            for (const entry of entries) {
                if ((entry.activity === conflict.entry1 || entry.activity === conflict.entry2) &&
                    entry.day === conflict.day) {
                    if (!entry.conflicts) entry.conflicts = [];
                    entry.conflicts.push(conflict.entry1 === entry.activity ? conflict.entry2 : conflict.entry1);
                }
            }
        }
        
        timetable.timetableEntries = entries;
        timetable.conflicts = conflicts;
        timetable.isGenerated = true;
        await timetable.save();
        
        res.json({
            timetable: entries,
            conflicts: conflicts,
            message: conflicts.length > 0 ? `Generated with ${conflicts.length} conflict(s)` : 'Timetable generated successfully',
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add subject
exports.addSubject = async (req, res) => {
    try {
        const { name, color, priority, hoursPerWeek } = req.body;
        
        const timetable = await Timetable.findOne({ userId: req.userId });
        if (!timetable) {
            return res.status(404).json({ message: 'Timetable not found' });
        }
        
        timetable.subjects.push({
            _id: new mongoose.Types.ObjectId(),
            name,
            color: color || '#' + Math.floor(Math.random()*16777215).toString(16),
            priority: priority || 1,
            hoursPerWeek: hoursPerWeek || 3,
        });
        
        await timetable.save();
        res.json(timetable.subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add activity
exports.addActivity = async (req, res) => {
    try {
        const { type, name, day, startTime, endTime, color, notes } = req.body;
        
        const timetable = await Timetable.findOne({ userId: req.userId });
        if (!timetable) {
            return res.status(404).json({ message: 'Timetable not found' });
        }
        
        timetable.activities.push({
            _id: new mongoose.Types.ObjectId(),
            type,
            name,
            day,
            startTime,
            endTime,
            color: color || '#' + Math.floor(Math.random()*16777215).toString(16),
            notes,
        });
        
        await timetable.save();
        res.json(timetable.activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete subject
exports.deleteSubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        
        const timetable = await Timetable.findOne({ userId: req.userId });
        if (!timetable) {
            return res.status(404).json({ message: 'Timetable not found' });
        }
        
        timetable.subjects = timetable.subjects.filter(s => s._id.toString() !== subjectId);
        await timetable.save();
        
        res.json(timetable.subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete activity
exports.deleteActivity = async (req, res) => {
    try {
        const { activityId } = req.params;
        
        const timetable = await Timetable.findOne({ userId: req.userId });
        if (!timetable) {
            return res.status(404).json({ message: 'Timetable not found' });
        }
        
        timetable.activities = timetable.activities.filter(a => a._id.toString() !== activityId);
        await timetable.save();
        
        res.json(timetable.activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update timetable entry
exports.updateTimetableEntry = async (req, res) => {
    try {
        const { entryId } = req.params;
        const { startTime, endTime, activity, day } = req.body;
        
        const timetable = await Timetable.findOne({ userId: req.userId });
        if (!timetable) {
            return res.status(404).json({ message: 'Timetable not found' });
        }
        
        const entry = timetable.timetableEntries.find(e => e._id.toString() === entryId);
        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }
        
        entry.startTime = startTime || entry.startTime;
        entry.endTime = endTime || entry.endTime;
        entry.activity = activity || entry.activity;
        entry.day = day || entry.day;
        
        await timetable.save();
        res.json(entry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete timetable entry
exports.deleteTimetableEntry = async (req, res) => {
    try {
        const { entryId } = req.params;
        
        const timetable = await Timetable.findOne({ userId: req.userId });
        if (!timetable) {
            return res.status(404).json({ message: 'Timetable not found' });
        }
        
        timetable.timetableEntries = timetable.timetableEntries.filter(e => e._id.toString() !== entryId);
        await timetable.save();
        
        res.json({ message: 'Entry deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
