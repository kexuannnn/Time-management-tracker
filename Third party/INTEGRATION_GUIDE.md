# Integration Guide: Adding Timetable Feature to TimeManagementApp

This guide explains how to integrate the new Timetable Customization feature with your existing TimeManagementApp.html.

## Overview

The timetable feature is **completely separate** from your existing task/activity management system. It uses:
- A **new backend** (Node.js + Express + MongoDB)
- **Separate frontend pages** (timetable-customizer.html, timetable-view.html)
- **Independent authentication** (JWT tokens)

This means:
✅ Your existing app continues to work as-is
✅ No breaking changes to current functionality
✅ Users can use both Task Management and Timetable features
✅ Data is kept separate (tasks ≠ timetable)

## Step 1: Update TimeManagementApp.html

Add a new button in your dashboard to access the timetable feature.

### Location: In the main content area (e.g., near the focus timer)

```html
<!-- Add this section in your dashboard -->
<div class="activity-box timetable-feature">
    <h3>📚 Timetable Management</h3>
    <p>Create and manage your personalized weekly timetable</p>
    <div class="timetable-actions">
        <button class="btn-primary" onclick="openTimetableCustomizer()">
            ✨ Customize Timetable
        </button>
        <button class="btn-secondary" onclick="viewExistingTimetable()">
            📅 View My Timetable
        </button>
    </div>
</div>
```

### Add CSS Styling

In your TimeManagementApp.html `<style>` section:

```css
.timetable-feature {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.timetable-feature h3 {
    color: white;
}

.timetable-feature p {
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 15px;
}

.timetable-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.timetable-actions .btn-primary,
.timetable-actions .btn-secondary {
    padding: 10px 16px;
    font-size: 13px;
}
```

### Add JavaScript Functions

In your TimeManagementApp.html `<script>` section:

```javascript
// ===== TIMETABLE NAVIGATION =====

function openTimetableCustomizer() {
    const token = localStorage.getItem('currentUser'); // Your existing auth token
    if (!token) {
        alert('Please login first');
        return;
    }
    
    // Store current user info for timetable app
    const user = JSON.parse(token);
    localStorage.setItem('authToken', user.token); // Adjust based on your token storage
    localStorage.setItem('userId', user.id); // Adjust based on your user ID storage
    
    window.location.href = 'timetable-customizer.html';
}

function viewExistingTimetable() {
    const token = localStorage.getItem('currentUser');
    if (!token) {
        alert('Please login first');
        return;
    }
    
    window.location.href = 'timetable-view.html';
}

// In your existing handleLogin function, also store JWT token:
function handleLogin(event) {
    event.preventDefault();
    const name = document.getElementById('nameInput').value;
    const email = document.getElementById('emailInput').value;

    currentUser = { name, email };
    
    // ... your existing code ...
    
    // Add this for timetable integration:
    // In a real app, your backend would return a JWT token
    // For now, store a temporary auth token
    const tempToken = btoa(JSON.stringify({ name, email, id: Date.now() }));
    localStorage.setItem('authToken', tempToken);
    localStorage.setItem('userId', Date.now().toString());
}

// In your existing handleLogout function, also clear timetable tokens:
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    
    // ... rest of your existing code ...
}
```

## Step 2: Update Backend Integration

### Option A: Use Separate JWT (Recommended for Production)

If your TimeManagementApp already has authentication, you can integrate the JWT tokens:

**In TimeManagementApp.html:**
```javascript
// When user logs in, get JWT from backend
async function handleLogin(event) {
    event.preventDefault();
    const name = document.getElementById('nameInput').value;
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;

    try {
        // Call your backend auth endpoint
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.token) {
            // Store JWT for timetable feature
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userId', data.user.id);
        }
        
        currentUser = { name, email };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // ... rest of your login logic ...
    } catch (error) {
        console.error('Login error:', error);
    }
}
```

### Option B: Dual Authentication (Quick Implementation)

If you want to keep your existing localStorage system, modify `frontend/js/timetable.js`:

**In timetable.js**, replace the API call function:

```javascript
async function apiCall(endpoint, method = 'GET', data = null) {
    // Get token from your existing app
    let token = localStorage.getItem('authToken');
    
    // If not found, create a temporary token from currentUser
    if (!token) {
        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        token = btoa(JSON.stringify(userData)); // Base64 encode
        localStorage.setItem('authToken', token);
    }

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
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
```

## Step 3: File Placement

Ensure all files are in the correct locations:

```
your-project/
├── backend/                              # NEW
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── TimeManagementApp.html            # EXISTING (updated)
│   ├── timetable-customizer.html         # NEW
│   ├── timetable-view.html               # NEW
│   ├── css/
│   │   ├── timetable.css                 # NEW
│   │   └── (existing CSS files)
│   └── js/
│       ├── timetable.js                  # NEW
│       └── (existing JS files)
├── Third party/                          # EXISTING
├── Time Management Tracker_files/        # EXISTING
├── .env                                  # NEW
├── setup.sh                              # NEW
├── README.md                             # NEW
└── style.css                             # EXISTING
```

## Step 4: Connect Your Existing User System

### Option 1: User Registration Bridge

Create a registration function that registers users in both systems:

```javascript
async function registerUserInTimetableSystem() {
    const name = document.getElementById('nameInput').value;
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;

    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        
        if (data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userId', data.user.id);
            return data;
        }
    } catch (error) {
        console.error('Error registering in timetable system:', error);
    }
}
```

Call this when user logs in:
```javascript
function handleLogin(event) {
    // ... existing login code ...
    registerUserInTimetableSystem();
}
```

## Step 5: Styling Consistency

To match the existing TimeManagementApp.html design, update the color scheme in `timetable.css`:

```css
/* Update gradient colors to match your app */
.customizer-header,
.viewer-header {
    /* Change these to match your app's primary colors */
    background: linear-gradient(135deg, #19376d 0%, #0f2847 100%);
}

.btn-primary {
    /* Match your existing button styles */
    background: linear-gradient(135deg, #19376d 0%, #0f2847 100%);
}
```

## Step 6: Testing the Integration

1. **Start the backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Open your app:**
   - Open `TimeManagementApp.html` in browser
   - Login/register
   - Click "Customize Timetable" button
   - Should navigate to customizer page

3. **Test the flow:**
   - ✅ Can access timetable customizer
   - ✅ Can add subjects
   - ✅ Can add activities
   - ✅ Can generate timetable
   - ✅ Can view timetable
   - ✅ Back button returns to dashboard

## Troubleshooting Integration Issues

### Issue: "API endpoint not found"
**Solution:** Ensure backend is running on localhost:5000

### Issue: "Token authentication failed"
**Solution:** Check token storage matches between apps

### Issue: "Page not found (404)"
**Solution:** Verify HTML files are in correct frontend/ directory

### Issue: "localStorage conflicts"
**Solution:** Use different keys for different auth systems
- Your app: `currentUser`, `tasks`
- Timetable app: `authToken`, `userId`

## Security Notes

⚠️ **Important for Production:**

1. **Never store JWT tokens in localStorage** in production
   - Use httpOnly cookies instead
   - Store tokens server-side

2. **Use HTTPS** in production
   - All API calls must be encrypted

3. **Implement token refresh**
   - Add refresh token mechanism
   - Automatically refresh expired tokens

4. **Validate all inputs** on server
   - Never trust client data

5. **Use environment variables** for secrets
   - Keep JWT_SECRET secure
   - Never commit .env to git

## Next Steps

1. ✅ Integrate the button into your dashboard
2. ✅ Set up backend and MongoDB
3. ✅ Test the timetable customizer
4. ✅ Customize colors to match your brand
5. ✅ Deploy to production
6. ✅ Add analytics/logging
7. ✅ Implement email notifications

---

**Need Help?** Refer to README.md for detailed documentation or contact your development team.
