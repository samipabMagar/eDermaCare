# eDermaCare

A full-stack dermatology e-care platform that connects patients with dermatologists, enables online product purchases for skincare, and supports treatment bookings — all in one place.

---

## Features

**For Patients**
- Browse and consult with verified dermatologists
- Book doctor appointments and treatment sessions
- Shop skincare products with cart and secure checkout
- Real-time chat with doctors via Socket.IO
- Email notifications and treatment reminders
- Pay via **Khalti** payment gateway

**For Admins**
- Manage users, doctors, appointments, and treatments
- Manage product catalog, brands, and orders
- View transactions and payment records

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, TailwindCSS 4 |
| **State Management** | Redux Toolkit, Redux Persist |
| **Animations** | GSAP |
| **Backend** | Express.js 5, Node.js |
| **Database** | MySQL + Sequelize ORM |
| **Real-time** | Socket.IO |
| **Auth** | JWT + HTTP-only cookies |
| **File Uploads** | Multer |
| **Email** | Nodemailer / Resend |
| **Payments** | Khalti |
| **Validation** | Zod |

---

## Project Structure

```
eDermaCare/
├── client/                 # Next.js frontend
│   └── src/
│       ├── app/            # Pages (main, admin, auth routes)
│       ├── components/     # Reusable UI components
│       ├── store/          # Redux store & slices
│       ├── services/       # API service functions
│       ├── hooks/          # Custom React hooks
│       └── utils/          # Helper utilities
│
└── server/                 # Express.js backend
    └── src/
        ├── controllers/    # Route handler logic
        ├── models/         # Sequelize DB models
        ├── routes/         # API route definitions
        ├── middlewares/    # Auth, validation middleware
        ├── services/       # Business logic layer
        ├── sockets/        # Socket.IO chat setup
        └── utils/          # Schedulers, helpers
```

---

## Getting Started

### Prerequisites

- Node.js `v18+`
- MySQL database

### 1. Clone the repository

```bash
git clone https://github.com/samipabMagar/final-year-project.git
cd eDermaCare
```

### 2. Install dependencies

```bash
# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

### 3. Configure environment variables

```bash
# In /client
cp .env.example .env

# In /server
cp .env.example .env
```

Fill in the values as described in the Environment Variables section below.

### 4. Run the development servers

Open two terminals:

```bash
# Terminal 1 — Frontend (http://localhost:3000)
cd client
npm run dev

# Terminal 2 — Backend (http://localhost:8001)
cd server
npm run dev
```

---

## Environment Variables

### `client/.env`

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (e.g. `http://localhost:8001/api`) |
| `NEXT_PUBLIC_APP_NAME` | Application name displayed in the UI |

### `server/.env`

| Variable | Description |
|---|---|
| `PORT` | Port for the Express server (default: `8001`) |
| `NODE_ENV` | Environment (`development` or `production`) |
| `DB_HOST` | MySQL host (e.g. `localhost`) |
| `DB_PORT` | MySQL port (default: `3306`) |
| `DB_NAME` | MySQL database name |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | JWT expiry duration (e.g. `7d`) |
| `CLIENT_URL` | Frontend URL for CORS (e.g. `http://localhost:3000`) |
| `KHALTI_RETURN_URL` | Khalti payment return URL |

---

## Available Scripts

### Client

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

### Server

| Script | Description |
|---|---|
| `npm run dev` | Start server with nodemon (hot reload) |
| `npm run seed:dummy-catalog` | Seed the database with dummy product catalog |

