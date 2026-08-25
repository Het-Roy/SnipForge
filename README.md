# SnipForge

**A modern developer platform for creating, organizing, discovering, and reusing code snippets.**

SnipForge is designed to help developers keep important code accessible and well-structured instead of scattered across files, chats, notes, and old projects. It gives users a clean workflow for saving reusable logic, documenting snippet purpose, and finding production-ready code faster whenever they need it.

Whether you are building personal utilities, storing team-ready patterns, or exploring community-contributed solutions, SnipForge helps reduce repetition and makes it easier to move from idea to implementation with confidence.

---

## Workflow

### 1. Signup

<img src="https://res.cloudinary.com/dwpjwccxd/image/upload/v1773736262/signup_cggdkq.png" alt="Signup page preview" width="100%" />

### 2. Login

<img src="https://res.cloudinary.com/dwpjwccxd/image/upload/v1773736117/login_lh0zow.png" alt="Login page preview" width="100%" />

### 3. Dashboard

<img src="https://res.cloudinary.com/dwpjwccxd/image/upload/v1773736719/dashboard_uwrxbp.png" alt="Dashboard preview" width="100%" />

### 4. Create & Publish

<img src="https://res.cloudinary.com/dwpjwccxd/image/upload/v1773736737/create_sasgzv.png" alt="Create snippet page preview" width="100%" />

### 5. Explore

<img src="https://res.cloudinary.com/dwpjwccxd/image/upload/v1773736758/explore_bxt1xy.png" alt="Explore page preview" width="100%" />

---

## Why SnipForge

- Centralizes reusable code in one searchable place
- Reduces time spent rewriting common logic
- Makes snippet descriptions and structure easier to maintain
- Supports both private organization and public discovery
- Improves development speed for individual users and teams

---

## Tech Stack

- **React**
- **Node.js**
- **Express.js**
- **MongoDB**
- **Tailwind CSS**
- **Redux Toolkit**

---

## How to Run the Application

### 1. Clone the project

```bash
git clone <YOUR_REPOSITORY_LINK>
cd snipForge-1
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `server` folder and add the required values for your project setup, such as:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

If your frontend depends on a custom backend URL, add the required frontend environment variables as well.

### 5. Start the backend server

Open a terminal in the `server` folder and run:

```bash
npm start
```

### 6. Start the frontend application

Open another terminal in the `frontend` folder and run:

```bash
npm start
```

### 7. Open the app in your browser

After both servers are running, open:

```bash
http://localhost:3000
```

The frontend will load in the browser and communicate with the backend server running locally.

---

### Created by **Roy Het Jayeshkumar**
