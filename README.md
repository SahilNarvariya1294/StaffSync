# StaffSync – Modern Human Resource Management System (MERN Stack)

StaffSync is an enterprise-grade Human Resource Management System built on the **MERN** stack (MongoDB, Express.js, React.js, and Node.js). It provides strict **Role-Based Access Control (RBAC)** across three core organizational personas: **HR Personnel**, **Managers**, and **Employees**.

---

## 👥 User Roles & Access Control Matrix

| Feature Module | HR Personnel | Managers | Employees |
| :--- | :---: | :---: | :---: |
| **Employee Management** | Create, View, Update, Deactivate | ❌ Restricted | View & Edit Own Personal Profile |
| **Leave Management** | Review, Approve, Reject with remarks | Oversee Team Leaves | Submit Requests, View Status |
| **Attendance Management** | Company-wide Tracking & Audit Logs | ❌ Restricted | Mark Attendance (Check-in/Out), History |
| **Announcements & News** | Create, Publish, Edit, Delete | View Announcements | View Announcements |
| **Training & Development** | ❌ Restricted | Create, Assign, Track Progress | View Assigned Programs & Progress |

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion
- **Backend:** Node.js, Express.js, JSON Web Tokens (JWT), BcryptJS
- **Database:** MongoDB with Mongoose ODM (with automatic embedded persistent document engine fallback for offline/isolated development)
- **Architecture:** Full-stack RESTful API + Vite SPA

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18+ or 20+
- (Optional) A running MongoDB instance locally (`mongodb://127.0.0.1:27017/staffsync`) or a MongoDB Atlas cloud URI. If MongoDB is not running, the application automatically uses the embedded persistent storage without interruption.

### 2. Environment Configuration
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

Configure your environment variables in `.env`:
```env
# MongoDB Connection URI (Local or Atlas)
MONGODB_URI="mongodb://127.0.0.1:27017/staffsync"

# JWT Signing Key
JWT_SECRET="staffsync_super_secret_jwt_key_2026_change_in_production"

# Server Port
PORT=3000

# Node Environment
NODE_ENV="development"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Full-Stack Application
In development:
```bash
npm run dev
```
The application will start on `http://localhost:3000` with both the Express REST API and Vite React frontend active.

For production builds:
```bash
npm run build
npm start
```

---

## 🔑 Pre-Configured Demo Accounts

For instant evaluation, you can sign in using one of the pre-seeded accounts:

| Role | Email | Password | Full Name & Title |
| :--- | :--- | :--- | :--- |
| **HR Personnel** | `hr@staffsync.com` | `password123` | Sarah Jenkins (Senior HR Officer) |
| **Manager** | `manager@staffsync.com` | `password123` | David Miller (Engineering Lead) |
| **Employee** | `employee@staffsync.com` | `password123` | Alex Rivera (Full Stack Engineer) |
| **Employee 2** | `emily@staffsync.com` | `password123` | Emily Chen (Product UX Designer) |
| **Employee 3** | `marcus@staffsync.com` | `password123` | Marcus Vance (QA Automation Engineer) |

> 💡 *Tip: You can also switch between roles instantaneously using the "Switch Role" dropdown located in the top navigation bar.*

---

## 📁 Project Architecture

```
/
├── server.ts                       # Express server entry point with Vite middleware
├── server/
│   ├── config/
│   │   └── db.ts                   # Database connection manager (Mongoose + Persistent fallback)
│   ├── models/
│   │   ├── User.ts                 # User credentials & authentication schema
│   │   ├── Employee.ts             # Comprehensive employee records schema
│   │   ├── LeaveRequest.ts         # Leave application schema
│   │   ├── Attendance.ts           # Daily check-in/out attendance schema
│   │   ├── Announcement.ts         # Company announcements schema
│   │   └── TrainingProgram.ts      # Team training & development schema
│   ├── middleware/
│   │   └── auth.ts                 # JWT validation & role-based authorization guard
│   ├── controllers/
│   │   ├── authController.ts       # Auth, profile, self-service personal records
│   │   ├── employeeController.ts   # HR employee CRUD & manager directory
│   │   ├── leaveController.ts      # Employee apply, HR approval, Manager team oversight
│   │   ├── attendanceController.ts # Punch clock & HR company tracking
│   │   ├── announcementController.ts # HR publish & company bulletin feed
│   │   └── trainingController.ts   # Manager training program management
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── employeeRoutes.ts
│   │   ├── leaveRoutes.ts
│   │   ├── attendanceRoutes.ts
│   │   ├── announcementRoutes.ts
│   │   └── trainingRoutes.ts
│   ├── services/
│   │   └── dbStore.ts              # Data abstraction layer for Mongoose and document storage
│   └── seed/
│       └── seedData.ts             # Initial database seed records
└── src/
    ├── context/
    │   └── AuthContext.tsx         # Global auth state, user profile, role switching
    ├── services/
    │   └── api.ts                  # REST API client with Bearer token authentication
    ├── types/
    │   └── index.ts                # TypeScript interfaces and domain models
    ├── components/
    │   ├── common/                 # Reusable UI widgets (Badge, Modal, StatCard)
    │   └── layout/                 # Navigation, Sidebar with role filtering, Header
    └── pages/
        ├── auth/LoginPage.tsx      # Sign-in page with quick 1-click role testing
        ├── dashboard/              # Role-specific dashboards (HR, Manager, Employee)
        ├── employees/              # HR Employee Directory & Employee Personal Records
        ├── leave/                  # HR Approvals, Manager Team Leaves, Employee Applications
        ├── attendance/             # HR Attendance Tracking & Employee Punch Clock
        ├── announcements/          # HR Publishing & Employee Bulletins
        └── training/               # Manager Training & Development Management
```
