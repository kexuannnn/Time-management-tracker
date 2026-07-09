# 📚 StudyFlow Timetable Customization Feature

## Overview

This is a complete full-stack timetable customization feature for the StudyFlow student time management application. It allows students to:

- ✨ Customize timetable settings (school hours, breaks, lunch time, etc.)
- 📖 Add subjects with custom colors and priorities
- 🎯 Add activities (CCA, work, personal events)
- ⚡ Auto-generate optimized timetables
- ⚠️ Detect and highlight time conflicts
- ✏️ Edit, drag-drop, and delete entries
- 💾 Persist timetables to MongoDB database
- 📅 View weekly timetable with color-coded activities

## Tech Stack

### Backend
- **Node.js** + **Express** - REST API server
- **MongoDB** - Database for storing timetables and user data
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **HTML5** + **CSS3** - Responsive UI
- **Vanilla JavaScript** - Client-side logic
- **Fetch API** - API communication

## Project Structure

```
project-root/
├── backend/
│   ├── models/
│   │   ├── User.js           # User schema
│   │   └── Timetable.js      # Timetable schema
│   ├── routes/
│   │   ├── auth.js           # Auth endpoints
│   │   └── timetable.js      # Timetable endpoints
│   ├── controllers/
│   │   └── timetableController.js  # Business logic
│   ├── middleware/
│   │   └── auth.js           # JWT verification
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── server.js             # Express app
│   └── package.json
├── frontend/
│   ├── timetable-customizer.html   # Customization UI
│   ├── timetable-view.html         # View timetable
│   ├── css/
│   │   └── timetable.css           # Styling
│   └── js/
│       └── timetable.js            # Frontend logic
├── .env                      # Environment variables
└── README.md                # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- Git

### Step 1: Backend Setup

```bash
cd backend
npm install
```

### Step 2: Configure MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Server
# Run MongoDB service
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `.env` file with your connection string

### Step 3: Environment Variables

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/studyflow
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/studyflow

JWT_SECRET=your-secret-key-change-this-in-production
PORT=5000
NODE_ENV=development
```

### Step 4: Start Backend

```bash
cd backend
npm start
# Or for development with auto-reload:
npm run dev
```

Expected output:
```
🚀 Server running on http://localhost:5000
MongoDB connected: localhost
```

### Step 5: Frontend Setup

1. Open the TimeManagementApp.html in your browser or serve it via HTTP
2. Update API endpoints if needed in `frontend/js/timetable.js`:
   ```javascript
   const API_BASE = 'http://localhost:5000/api';
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Timetable Management
- `POST /api/timetable/create` - Create/update timetable
- `GET /api/timetable` - Get user's timetable
- `POST /api/timetable/generate` - Generate timetable
- `POST /api/timetable/subjects` - Add subject
- `DELETE /api/timetable/subjects/:subjectId` - Delete subject
- `POST /api/timetable/activities` - Add activity
- `DELETE /api/timetable/activities/:activityId` - Delete activity
- `PUT /api/timetable/entries/:entryId` - Update entry
- `DELETE /api/timetable/entries/:entryId` - Delete entry

## Usage Flow

### For Students

1. **Login/Register**
   - Enter credentials in TimeManagementApp.html

2. **Customize Timetable** (Click "Customize Timetable" button)
   - Set school hours
   - Configure lessons per day
   - Set break and lunch times
   - Choose school days
   - Set study preferences

3. **Add Subjects**
   - Enter subject names
   - Choose colors for visualization
   - Set priority and hours per week

4. **Add Activities**
   - Add CCA, work, or personal events
   - Specify day and time
   - Add notes if needed

5. **Review & Generate**
   - Review all settings
   - System auto-detects conflicts
   - Generate optimized timetable

6. **View Timetable**
   - See weekly schedule with colors
   - Edit any entry
   - Drag and drop to reschedule
   - Delete conflicts as needed

## Database Schema

### User
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

### Timetable
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  name: String,
  settings: {
    schoolStartTime: String,
    schoolEndTime: String,
    lessonsPerDay: Number,
    breakTime: Number,
    lunchTime: Number,
    schoolDays: [String],
    studyDuration: Number,
    studyTime: String
  },
  subjects: [{
    _id: ObjectId,
    name: String,
    color: String,
    priority: Number,
    hoursPerWeek: Number
  }],
  activities: [{
    _id: ObjectId,
    type: String,
    name: String,
    day: String,
    startTime: String,
    endTime: String,
    color: String,
    notes: String
  }],
  timetableEntries: [{
    _id: ObjectId,
    day: String,
    startTime: String,
    endTime: String,
    activity: String,
    type: String,
    color: String,
    conflicts: [String]
  }],
  isGenerated: Boolean,
  conflicts: [{
    day: String,
    entry1: String,
    entry2: String,
    startTime: String,
    endTime: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## Features

### ✅ Implemented
- [x] User authentication (JWT)
- [x] Timetable customization interface
- [x] Subject management
- [x] Activity management (CCA, work, personal)
- [x] Auto timetable generation
- [x] Conflict detection algorithm
- [x] Weekly timetable view
- [x] Color-coded entries
- [x] Edit/delete entries
- [x] Responsive design (mobile, tablet, desktop)
- [x] Data persistence (MongoDB)
- [x] Real-time statistics

### 🔄 Possible Enhancements
- [ ] Drag-and-drop rescheduling
- [ ] PDF export
- [ ] Print functionality
- [ ] Calendar sharing
- [ ] Collaboration features
- [ ] Mobile app
- [ ] Email notifications
- [ ] Recurring activities
- [ ] Study reminders
- [ ] Performance analytics

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Ensure MongoDB is running or update `MONGODB_URI` with correct connection string.

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Ensure backend is running and API_BASE URL is correct in frontend/js/timetable.js

### 404 Not Found
```
Cannot POST /api/timetable/create
```
**Solution:** 
- Check if backend server is running
- Verify all routes are registered in server.js
- Check `jwt token` is being sent with Authorization header

### Token Expired
```
message: "Invalid token"
```
**Solution:** 
- Login again to get a new token
- Token stored in localStorage should expire in 7 days
- Clear browser cache if needed

## Integration with Existing App

### Adding "Customize Timetable" Button

In your `TimeManagementApp.html`, add this button:

```html
<button class="btn btn-primary" onclick="openTimetableCustomizer()">
    📚 Customize Timetable
</button>
```

Add this JavaScript:

```javascript
function openTimetableCustomizer() {
    window.location.href = 'timetable-customizer.html';
}

function goBackToDashboard() {
    window.location.href = 'TimeManagementApp.html';
}
```

### Storing Auth Token

The frontend stores JWT token in localStorage:

```javascript
localStorage.setItem('authToken', token);
localStorage.setItem('userId', user.id);
```

When creating a new user account in your existing app:

```javascript
const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
});
const data = await response.json();
localStorage.setItem('authToken', data.token);
localStorage.setItem('userId', data.user.id);
```

## Deployment

### Heroku Deployment

**Backend:**
```bash
cd backend
heroku login
heroku create your-app-name
heroku config:set MONGODB_URI=your-mongo-atlas-url
git push heroku main
```

**Frontend:**
- Host on Netlify, Vercel, or GitHub Pages
- Update `API_BASE` to deployed backend URL

### AWS/DigitalOcean Deployment

**Backend:**
- Create EC2/droplet instance
- Install Node.js and MongoDB
- Clone repository
- Run `npm install` and `npm start`
- Use PM2 for process management

**Frontend:**
- Upload to S3 or serve via CloudFront
- Update API endpoints

## Performance Optimization

- **Frontend:** Lazy load components, minimize CSS/JS
- **Backend:** Add caching, optimize MongoDB queries
- **Database:** Create indexes on userId, day fields
- **API:** Use compression middleware

## Security Considerations

- [ ] Use HTTPS in production
- [ ] Set strong JWT_SECRET
- [ ] Validate all inputs on backend
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting
- [ ] Add CORS whitelist
- [ ] Hash passwords (already done with bcryptjs)
- [ ] Implement request validation

## Support & License

For issues or feature requests, please contact your development team.

---

**Last Updated:** July 2026  
**Version:** 1.0.0
