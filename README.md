# 🌄 DayNest

### A better you, every day.

DayNest is a personal wellness and productivity web application designed to help users
track their daily habits, record moods, write journal entries, preserve memories,
and visualize their personal growth throughout the year.

The application combines habit tracking, mood journaling, memory management,
calendar visualization, analytics, and notifications into one simple platform.

---

## ✨ Features

### 📅 Yearly Calendar
- View your activities throughout the year
- Track journal entries and daily activities
- Quickly navigate to a specific date
- Visualize your yearly progress

### ✅ Habit Tracker
- Create and manage daily habits
- Mark habits as completed
- Track habit streaks
- Monitor daily and overall progress

### 😊 Mood Tracking
- Record your daily mood
- Track mood patterns over time
- Connect moods with journal entries

### 📖 Journal
- Create daily journal entries
- Edit and delete entries
- Add tags to journal entries
- Associate journal entries with specific dates

### 📸 Memories
- Upload photos and videos
- Preserve important moments
- View memories associated with specific dates

### 📊 Analytics
- Analyze habit completion
- View mood patterns
- Track personal progress
- Get meaningful insights from your activities

### 🔔 Notifications
- Receive reminders for daily activities
- Get habit completion reminders
- View unread and read notifications

### 👤 Profile
- Manage personal profile information
- Upload profile picture
- Edit account details
- Manage preferences

### 🔍 Global Search
Search across:
- Journal entries
- Habits
- Memories
- Dates

### ❓ Help & Support
- Getting started guide
- Habit tracking help
- Journal help
- Calendar guide
- Analytics guide
- Notification guide
- Profile and settings help

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- HTML5
- CSS3

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Authentication
- JWT Authentication

### Tools & Platforms
- Git
- GitHub
- VS Code

---

## 🏗️ Project Architecture

DayNest
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── App.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── uploads/
│   ├── config/
│   ├── server.js
│   └── package.json
│
└── README.md
````

> The folder structure may vary depending on the current implementation.

---

## 🔄 How DayNest Works


             User
               │
               ▼
        React Frontend
               │
               ▼
        Express Backend
               │
       ┌───────┴────────┐
       ▼                ▼
 MongoDB Database    Media Storage
       │
       ▼
 Habit / Mood / Journal
 Calendar / Memories
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/DayNest.git
```

Move into the project:

```bash
cd DayNest
```

---

## 💻 Frontend Setup

Navigate to the client folder:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173
```

---

## ⚙️ Backend Setup

Open another terminal.

Navigate to the server:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm start
```

or, if your project uses Nodemon:

```bash
npm run dev
```

---

## 🔐 Environment Variables

### Frontend

```env
VITE_API_URL=
```

### Backend

```env
PORT=
MONGO_URI=
JWT_SECRET=
CLIENT_URL=
```

⚠️ **Never commit `.env` files or secret keys to GitHub.**

---

## 📱 Responsive Design

DayNest is designed to provide a responsive experience across:

* 💻 Desktop
* 💻 Laptop
* 📱 Mobile
* 📱 Tablet

---

## 🎨 UI/UX

DayNest uses a modern **glassmorphism-inspired interface** combined with a
mountain-themed background.

The design focuses on:

* Clean interface
* Minimal navigation
* Comfortable readability
* Responsive layouts
* Visual progress tracking
* Calm and distraction-free experience

---

## 🔒 Security

The application includes:

* User authentication
* Protected API routes
* JWT-based authentication
* User-specific data access
* Environment variables for sensitive configuration
* Backend validation

---

## ☁️ Deployment

The application can be deployed using:

```text
Frontend  → Vercel
Backend   → Render
Database  → MongoDB Atlas
```

Production architecture:

```text
                 ┌─────────────┐
                 │    User     │
                 └──────┬──────┘
                        │
                        ▼
                 ┌─────────────┐
                 │   Vercel    │
                 │ React/Vite  │
                 └──────┬──────┘
                        │
                        ▼
                 ┌─────────────┐
                 │   Render    │
                 │ Node/Express│
                 └──────┬──────┘
                        │
                        ▼
                 ┌─────────────┐
                 │ MongoDB     │
                 │    Atlas    │
                 └─────────────┘
```

---

## 🔮 Future Enhancements

Possible future improvements include:

* 🤖 AI-powered personal insights
* 📈 Advanced habit prediction
* 🧠 AI mood analysis
* ☁️ Cloud media storage
* 📱 Progressive Web App (PWA)
* 📲 Mobile application
* 🔔 Advanced push notifications
* 📊 More detailed analytics
* 🎯 Personalized habit recommendations

---

## 👩‍💻 Developer

**Rithika Sree U**

Computer Science & Engineering Student

---

## 📄 License

This project is developed for educational and portfolio purposes.

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.
