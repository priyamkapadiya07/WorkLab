# WorkLab - Developer Project Vault 🚀

WorkLab is a comprehensive, self-hosted developer dashboard and project management vault. Designed for software engineers, it allows you to track all your local, in-development, and completed projects in one place. It integrates directly with GitHub to pull in repositories and manage deployment statuses with a beautiful, high-end "Luxury Editorial" user interface.

## 🌟 Features

- **GitHub Synchronization**: Connect your GitHub account via OAuth and import repositories directly into your local vault with one click.
- **Project Tracking**: Manage metadata, tech stacks, deployment links, and project status (e.g., *In Development*, *Completed*).
- **Deployment Monitoring**: Automatically counts and tracks projects with live deployment URLs.
- **Lightning Fast**: Built with React Context for global state management—switching tabs is completely instant with zero database loading times.
- **Luxury UI/UX**: Designed using a high-end editorial aesthetic featuring **Bodoni Moda** (luxury serif) and **Jost** (clean sans-serif) typography, complete with dynamic micro-animations, glassmorphism, and an OLED dark mode.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **State Management**: React Context API
- **Icons**: Lucide React
- **Typography**: Bodoni Moda, Jost, JetBrains Mono

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT & GitHub OAuth
- **Security**: Helmet, CORS

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB Database (Local or MongoDB Atlas)
- A GitHub OAuth Application (for client ID and secret)

### 1. Clone the repository
```bash
git clone https://github.com/priyamkapadiya07/WorkLab.git
cd WorkLab
```

### 2. Setup the Backend
Open a terminal and navigate to the server directory:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory and add your credentials:
```env
# Server Configuration
PORT=5000
NODE_ENV=development
SERVER_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173

# Database Configuration
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/worklab

# Authentication Configuration
JWT_SECRET=your_super_secret_jwt_key
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
```

Start the backend development server:
```bash
npm run dev
```

### 3. Setup the Frontend
Open a new terminal and navigate to the client directory:
```bash
cd client
npm install
```

Start the frontend development server:
```bash
npm run dev
```

### 4. Access the App
Open your browser and navigate to `http://localhost:5173`. You will be prompted to log in using your GitHub account!

---

## 📁 Project Structure

```text
WorkLab/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components (Buttons, Modals, Skeletons)
│   │   ├── context/            # React Context (AuthContext, ProjectContext)
│   │   ├── pages/              # Application Pages (Dashboard, Projects, GithubSync)
│   │   ├── App.jsx             # Main Application Router
│   │   └── index.css           # Global Styles & Tailwind Config
│   └── tailwind.config.js      # Tailwind theme and typography config
│
└── server/                     # Express Backend
    ├── models/                 # Mongoose Database Models (User, Project)
    ├── routes/                 # API Endpoints (auth.js, projects.js, github.js)
    └── index.js                # Server entry point & Middleware
```

## 📝 License
This project is open-source and available for personal use and modification.
