// ===== API CONFIGURATION =====
const API_BASE = 'http://localhost:5000/api';
let currentToken = localStorage.getItem('authToken');
let currentUserId = localStorage.getItem('userId');

// ===== UTILITY FUNCTIONS =====
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`,
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

// ===== CUSTOMIZER PAGE FUNCTIONS =====

function moveToSection(sectionName) {
    document.querySelectorAll('.customizer-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const section = document.getElementById(`section-${sectionName}`);
    const navItem = document.querySelector(`[data-section="${sectionName}"]`);

    if (section) section.classList.add('active');
    if (navItem) navItem.classList.add('active');

    if (sectionName === 'review') {
        populateReviewSection();
    }

    window.scrollTo(0, 0);
}

// Color picker update
document.addEventListener('DOMContentLoaded', () => {
    const colorPicker = document.getElementById('subjectColor');
    if (colorPicker) {
        colorPicker.addEventListener('change', (e) => {
            document.getElementById('colorPreview').style.backgroundColor = e.target.value;
        });
    }

    // Navigation setup
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.getAttribute('data-section');
            moveToSection(section);
        });
    });
});

// Add subject
async function addSubject() {
    const name = document.getElementById('subjectName').value;
    const color = document.getElementById('subjectColor').value;

    if (!name) {
        alert('Please enter a subject name');
        return;
    }

    try {
        const timetable = await apiCall('/timetable', 'POST', { subjects: [{ name, color }] });
        renderSubjects(timetable.subjects);
        document.getElementById('subjectName').value = '';
        document.getElementById('subjectColor').value = '#FF6B6B';
    } catch (error) {
        alert('Error adding subject: ' + error.message);
    }
}

// Add activity
async function addActivity() {
    const name = document.getElementById('activityName').value;
    const type = document.getElementById('activityType').value;
    const day = document.getElementById('activityDay').value;
    const startTime = document.getElementById('activityStart').value;
    const endTime = document.getElementById('activityEnd').value;
    const color = document.getElementById('activityColor').value;
    const notes = document.getElementById('activityNotes').value;

    if (!name || !startTime || !endTime) {
        alert('Please fill all required fields');
        return;
    }

    try {
        const timetable = await apiCall('/timetable/activities', 'POST', {
            type, name, day, startTime, endTime, color, notes,
        });
        renderActivities(timetable.activities);
        document.getElementById('activityName').value = '';
        document.getElementById('activityNotes').value = '';
    } catch (error) {
        alert('Error adding activity: ' + error.message);
    }
}

// Render subjects
function renderSubjects(subjects) {
    const container = document.getElementById('subjectsList');
    container.innerHTML = subjects.map(subject => `
        <div class="subject-card">
            <div class="card-header">
                <span class="card-title">
                    <span class="color-dot" style="background-color: ${subject.color};"></span>
                    ${subject.name}
                </span>
                <button class="card-delete" onclick="deleteSubject('${subject._id}')">Delete</button>
            </div>
            <div class="card-details">
                <p><strong>Priority:</strong> ${subject.priority}</p>
                <p><strong>Hours/Week:</strong> ${subject.hoursPerWeek}h</p>
            </div>
        </div>
    `).join('');
}

// Render activities
function renderActivities(activities) {
    const container = document.getElementById('activitiesList');
    container.innerHTML = activities.map(activity => `
        <div class="activity-card">
            <div class="card-header">
                <span class="card-title">
                    <span class="color-dot" style="background-color: ${activity.color};"></span>
                    ${activity.name}
                </span>
                <button class="card-delete" onclick="deleteActivity('${activity._id}')">Delete</button>
            </div>
            <div class="card-details">
                <p><strong>Type:</strong> ${activity.type}</p>
                <p><strong>Day:</strong> ${activity.day}</p>
                <p><strong>Time:</strong> ${activity.startTime} - ${activity.endTime}</p>
                ${activity.notes ? `<p><strong>Notes:</strong> ${activity.notes}</p>` : ''}
            </div>
        </div>
    `).join('');
}

// Delete subject
async function deleteSubject(subjectId) {
    if (confirm('Delete this subject?')) {
        try {
            await apiCall(`/timetable/subjects/${subjectId}`, 'DELETE');
            const timetable = await apiCall('/timetable');
            renderSubjects(timetable.subjects);
        } catch (error) {
            alert('Error deleting subject: ' + error.message);
        }
    }
}

// Delete activity
async function deleteActivity(activityId) {
    if (confirm('Delete this activity?')) {
        try {
            await apiCall(`/timetable/activities/${activityId}`, 'DELETE');
            const timetable = await apiCall('/timetable');
            renderActivities(timetable.activities);
        } catch (error) {
            alert('Error deleting activity: ' + error.message);
        }
    }
}

// Populate review section
async function populateReviewSection() {
    try {
        const timetable = await apiCall('/timetable');
        const settings = timetable.settings;

        // Settings summary
        document.getElementById('settingsSummary').innerHTML = `
            <p><strong>School Hours:</strong> ${settings.schoolStartTime} - ${settings.schoolEndTime}</p>
            <p><strong>Lessons per Day:</strong> ${settings.lessonsPerDay}</p>
            <p><strong>Break Time:</strong> ${settings.breakTime} minutes</p>
            <p><strong>Lunch Time:</strong> ${settings.lunchTime} minutes</p>
            <p><strong>School Days:</strong> ${settings.schoolDays.join(', ')}</p>
            <p><strong>Study Duration:</strong> ${settings.studyDuration} minutes</p>
            <p><strong>Preferred Time:</strong> ${settings.studyTime}</p>
        `;

        // Subjects summary
        document.getElementById('subjectsSummary').innerHTML = timetable.subjects.length > 0
            ? timetable.subjects.map(s => `<p>🔹 ${s.name} (${s.hoursPerWeek}h/week)</p>`).join('')
            : '<p>No subjects added yet</p>';

        // Activities summary
        document.getElementById('activitiesSummary').innerHTML = timetable.activities.length > 0
            ? timetable.activities.map(a => `<p>🔹 ${a.name} (${a.type}) - ${a.day} ${a.startTime}-${a.endTime}</p>`).join('')
            : '<p>No activities added yet</p>';
    } catch (error) {
        console.error('Error populating review:', error);
    }
}

// Generate timetable
async function generateTimetable() {
    if (document.querySelectorAll('.subject-card').length === 0) {
        alert('Please add at least one subject');
        return;
    }

    const loader = document.getElementById('loadingSpinner');
    loader.style.display = 'flex';

    try {
        // First save settings
        const settings = {
            schoolStartTime: document.getElementById('schoolStartTime').value,
            schoolEndTime: document.getElementById('schoolEndTime').value,
            lessonsPerDay: parseInt(document.getElementById('lessonsPerDay').value),
            breakTime: parseInt(document.getElementById('breakTime').value),
            lunchTime: parseInt(document.getElementById('lunchTime').value),
            schoolDays: Array.from(document.querySelectorAll('.school-day:checked')).map(cb => cb.value),
            studyDuration: parseInt(document.getElementById('studyDuration').value),
            studyTime: document.getElementById('studyTime').value,
        };

        await apiCall('/timetable/create', 'POST', { settings });

        // Generate timetable
        const result = await apiCall('/timetable/generate', 'POST');

        loader.style.display = 'none';

        if (result.conflicts.length > 0) {
            alert(`⚠️ Timetable generated with ${result.conflicts.length} conflict(s). You can resolve them in the view.`);
        } else {
            alert('✅ Timetable generated successfully!');
        }

        // Redirect to view
        setTimeout(() => {
            window.location.href = 'timetable-view.html';
        }, 1000);
    } catch (error) {
        loader.style.display = 'none';
        alert('Error generating timetable: ' + error.message);
    }
}

// Go back to dashboard
function goBackToDashboard() {
    window.location.href = 'TimeManagementApp.html';
}

// ===== TIMETABLE VIEW PAGE FUNCTIONS =====

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
let currentTimetable = null;
let editingEntryId = null;

async function loadTimetable() {
    try {
        currentTimetable = await apiCall('/timetable');
        renderTimetableGrid();
        renderLegend();
        renderStatistics();
        
        if (currentTimetable.conflicts && currentTimetable.conflicts.length > 0) {
            showConflicts();
        }
    } catch (error) {
        console.error('Error loading timetable:', error);
        alert('Error loading timetable. Please customize one first.');
        goBackToDashboard();
    }
}

function renderTimetableGrid() {
    const grid = document.getElementById('timetableGrid');
    if (!grid || !currentTimetable.timetableEntries) return;

    let html = '';

    // Add day headers
    html += '<div class="time-cell"></div>';
    const activeDays = [...new Set(currentTimetable.timetableEntries.map(e => e.day))];
    activeDays.forEach(day => {
        html += `<div class="day-header">${day}</div>`;
    });

    // Get all unique times
    const times = [...new Set(currentTimetable.timetableEntries.map(e => e.startTime))].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

    // Render grid
    times.forEach(time => {
        html += `<div class="time-cell">${time}</div>`;

        activeDays.forEach(day => {
            const entry = currentTimetable.timetableEntries.find(e => e.day === day && e.startTime === time);
            if (entry) {
                const conflictClass = entry.conflicts && entry.conflicts.length > 0 ? 'has-conflict' : '';
                html += `
                    <div class="timetable-entry ${conflictClass}" style="background-color: ${entry.color}80;" onclick="editEntry('${entry._id}')">
                        <div>
                            <div style="font-weight: bold;">${entry.activity}</div>
                            <div style="font-size: 11px;">${entry.startTime}-${entry.endTime}</div>
                        </div>
                    </div>
                `;
            } else {
                html += '<div class="timetable-entry"></div>';
            }
        });
    });

    grid.innerHTML = html;
}

function renderLegend() {
    if (!currentTimetable.subjects && !currentTimetable.activities) return;

    const items = [
        ...currentTimetable.subjects.map(s => ({ name: s.name, color: s.color })),
        ...currentTimetable.activities.map(a => ({ name: a.name, color: a.color })),
        { name: 'Break', color: '#FFE5B4' },
        { name: 'Lunch', color: '#FFA500' },
    ];

    const html = items.map(item => `
        <div class="legend-item">
            <div class="legend-color" style="background-color: ${item.color};"></div>
            <span>${item.name}</span>
        </div>
    `).join('');

    document.getElementById('legendItems').innerHTML = html;
}

function renderStatistics() {
    const entries = currentTimetable.timetableEntries || [];
    const subjects = currentTimetable.subjects || [];
    
    const totalHours = entries.reduce((sum, e) => {
        const start = timeToMinutes(e.startTime);
        const end = timeToMinutes(e.endTime);
        return sum + (end - start) / 60;
    }, 0);

    const html = `
        <div class="stat-card">
            <h4>Total Study Hours/Week</h4>
            <div class="stat-value">${totalHours.toFixed(1)}h</div>
        </div>
        <div class="stat-card">
            <h4>Total Subjects</h4>
            <div class="stat-value">${subjects.length}</div>
        </div>
        <div class="stat-card">
            <h4>School Days</h4>
            <div class="stat-value">${currentTimetable.settings.schoolDays.length}</div>
        </div>
        <div class="stat-card">
            <h4>Time Conflicts</h4>
            <div class="stat-value">${currentTimetable.conflicts ? currentTimetable.conflicts.length : 0}</div>
        </div>
    `;

    document.getElementById('statsGrid').innerHTML = html;
}

function showConflicts() {
    const section = document.getElementById('conflictsSection');
    const list = document.getElementById('conflictsList');

    const html = currentTimetable.conflicts.map(c => `
        <div style="padding: 10px; background: #fff3cd; border-radius: 6px; margin: 10px 0;">
            <strong>${c.day}:</strong> ${c.entry1} overlaps with ${c.entry2}
        </div>
    `).join('');

    list.innerHTML = html;
    section.style.display = 'block';
}

function editEntry(entryId) {
    const entry = currentTimetable.timetableEntries.find(e => e._id === entryId);
    if (!entry) return;

    editingEntryId = entryId;
    document.getElementById('editActivityName').value = entry.activity;
    document.getElementById('editStartTime').value = entry.startTime;
    document.getElementById('editEndTime').value = entry.endTime;

    document.getElementById('editMode').style.display = 'block';
}

async function saveEntryEdit() {
    const startTime = document.getElementById('editStartTime').value;
    const endTime = document.getElementById('editEndTime').value;
    const activity = document.getElementById('editActivityName').value;

    try {
        await apiCall(`/timetable/entries/${editingEntryId}`, 'PUT', {
            startTime,
            endTime,
            activity,
        });

        await loadTimetable();
        cancelEdit();
    } catch (error) {
        alert('Error updating entry: ' + error.message);
    }
}

async function deleteEntry() {
    if (confirm('Delete this timetable entry?')) {
        try {
            await apiCall(`/timetable/entries/${editingEntryId}`, 'DELETE');
            await loadTimetable();
            cancelEdit();
        } catch (error) {
            alert('Error deleting entry: ' + error.message);
        }
    }
}

function cancelEdit() {
    document.getElementById('editMode').style.display = 'none';
    editingEntryId = null;
}

function editTimetable() {
    window.location.href = 'timetable-customizer.html';
}

function downloadTimetable() {
    const element = document.getElementById('timetableGrid');
    const opt = {
        margin: 10,
        filename: 'My_Timetable.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' },
    };

    alert('PDF download feature requires html2pdf library. Add it to generate PDF.');
}

function moveToEditMode() {
    // Implementation for resolving conflicts
}

// Load on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('timetableGrid')) {
        loadTimetable();
    }
});
