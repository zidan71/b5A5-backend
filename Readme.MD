# 📦 Parcel Delivery Backend System

A full-featured backend API for a parcel delivery platform, built with **Node.js**, **Express.js**, **MongoDB (Mongoose)**, and **TypeScript**.  
This system supports **authentication**, **role-based access**, **parcel lifecycle management**, and **admin control**.

---

## 🚀 Features

### ✅ Authentication & Authorization
- Secure user registration and login with JWT
- Role-based access: `admin`, `sender`, `receiver`
- Authorization middleware to protect routes

### 📦 Parcel Management
- Senders can:
  - Create parcels
  - View status & logs
  - Cancel if still `Requested`
- Receivers can:
  - Confirm delivery when status is `In Transit` or `Dispatched`
- Track parcels using tracking ID (public)
- Status log with timestamps and actor (sender/admin)

### 🧑‍💼 Admin Features
- View all users
- Block/unblock users
- Update parcel status (e.g., mark as dispatched/delivered)
- Dashboard-ready endpoints (counts by status, user stats, etc.)

### ⚙️ Bonus Utilities
- Fee calculator (by weight and distance)
- Parcel filtering by user, role, or status

---


## 🧱 Tech Stack

| Layer       | Tech                     |
|-------------|--------------------------|
| Backend     | Node.js, Express.js      |
| Database    | MongoDB with Mongoose    |
| Auth        | JWT                      |
| Language    | TypeScript               |
| Deployment  | Vercel / Render (API)    |

---



## 🛠️ Getting Started

### 1. Clone the Repo
```bash
git clone https://github.com/zidan71/b5A5-backend
cd b5A5-backend

npm install
npm run dev

----------------------------------------------API ENDPOINTS----------------------------------

🔐 Auth
POST /api/auth/register
POST /api/auth/login

👥 Users
GET /api/users (admin)
PATCH /api/users/:id/block (admin)

📦 Parcels
POST /api/parcels (sender)
GET /api/parcels/mine (sender/receiver)
PATCH /api/parcels/:id/cancel (sender)
PATCH /api/parcels/:id/status (admin)
PATCH /api/parcels/:id/confirm-delivery (receiver)

🌐 Public
GET /api/parcels/track/:trackingId
GET /api/utils/calculate-fee?weight=2.5&distance=10
