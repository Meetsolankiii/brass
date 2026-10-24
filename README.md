# Rajnish Industries — Full-Stack Client Website

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (or update DATABASE_URL in `/backend/.env` to use SQLite)

---

### 1. Setup Backend

```bash
cd backend
npm install
```

Update `backend/.env` with your PostgreSQL connection string:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/rajnish_db"
```

Run database migrations and seed:
```bash
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
```

Start the backend dev server:
```bash
npm run dev
```
→ Backend runs at `http://localhost:5000`

---

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```
→ Frontend runs at `http://localhost:5173`

---

## 🔐 Admin Access

- URL: `http://localhost:5173/admin/login`
- Username: `admin`
- Password: `admin123`
- **⚠️ Change this password immediately in production!**

---

## 📁 Project Structure

```
rajnish/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts           # Seed data (products, categories, etc.)
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/        # Auth, upload, validation
│   │   ├── routes/            # Express routers
│   │   ├── utils/             # JWT, Prisma, response helpers
│   │   ├── types/             # TypeScript types
│   │   ├── app.ts             # Express application
│   │   └── server.ts          # Entry point
│   ├── uploads/               # Uploaded images (auto-created)
│   └── .env                   # Environment configuration
│
└── frontend/
    ├── src/
    │   ├── admin/             # Admin dashboard
    │   │   ├── components/    # Layout, sidebar, forms
    │   │   └── pages/         # Dashboard, Products, Categories, etc.
    │   ├── components/        # Public UI components
    │   │   ├── layout/        # Navbar, Footer
    │   │   ├── sections/      # Homepage sections
    │   │   ├── shared/        # ProductCard, animations
    │   │   └── ui/            # Modal, Toast, Skeleton, Spinner
    │   ├── pages/             # Public pages
    │   ├── services/          # API service layer
    │   ├── store/             # Zustand state
    │   └── types/             # TypeScript interfaces
    ├── tailwind.config.ts     # Design tokens
    └── .env                   # VITE_API_URL
```

---

## 🎨 Customizing Content

All website text, contact details, and settings can be edited via:
**Admin Panel → Site Content**

To update products, categories, testimonials, and services:
**Admin Panel → respective section**

---

## 🚀 Production Deployment

### Backend
```bash
npm run build
npm start
```

### Frontend
```bash
npm run build
# Deploy the `dist/` folder to your web server or CDN
```

---

## 📝 Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | JWT access token secret |
| `JWT_REFRESH_SECRET` | JWT refresh token secret |
| `ALLOWED_ORIGINS` | Frontend URL for CORS |

### Frontend (`frontend/.env`)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL |

---

## 🛠️ Tech Stack

**Backend**: Node.js · Express · TypeScript · Prisma ORM · PostgreSQL · JWT · Multer

**Frontend**: React 18 · TypeScript · Vite · Tailwind CSS v3 · Framer Motion · TanStack Query · Zustand · React Hook Form · Zod
