# NEURIVAHUB

**A tech hub for young creators in Tanzania.** Learn to code, build real projects, and launch them.

NeurivaHub is a full-stack web app: a bold, Gen Z "sound waves poster" style website, a REST API with real login, and an admin dashboard to manage the hub.

> Colors: Jet Black `#0B0B0B` · Hot Pink `#FF2DA6` · Chartreuse `#D4FF3F` · White `#FFFFFF` · Grey `#1A1A1A`

## Features

**Website**
- Home with giant "NEURIVA / HUB" headline, floating neon shapes, grain texture and a scrolling marquee
- About, Courses (6 cards), Projects (with filter), Events (with Register button), Pricing (Free / Pro / Premium) and Contact
- Sign up and log in with JWT
- Fully responsive, built for phones first
- Lucide icons only, no emojis

**Admin dashboard (`/#/admin`)**
- Stats cards (users, courses, projects, revenue) and a signups chart
- Manage users (view, delete)
- Add, edit and delete courses
- Read contact messages
- API key generator
- Settings: change logo text and brand colors

## Tech stack

| Part | Tools |
|------|-------|
| Frontend | React 18, Vite, Tailwind CSS, Lucide React, htm |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB |
| Auth | JWT (jsonwebtoken) and bcryptjs |

## Project structure

```
neurivahub/
├── client/       React + Vite + Tailwind website
│   └── src/      App.jsx (all pages), index.css (design system)
├── server/       Express API
│   └── server.js models, auth, routes, first-run seed
└── standalone/   One-file demo of the website (data saved in the browser only)
```

## Getting started

### 1. Requirements
- [Node.js](https://nodejs.org) 18 or newer
- MongoDB: a local install, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) database

### 2. Get the code
```bash
git clone https://github.com/U77Y/neurivahub.git
cd neurivahub
```

### 3. Start the server
```bash
cd server
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev
```
Open http://localhost:5000/api/courses. You should see 6 courses. On first run the server creates the admin account and fills in the starter courses, projects and events.

### 4. Start the website
Open a second terminal:
```bash
cd client
npm install
npm run dev
```
Open http://localhost:5173

### 5. Log in as admin
Email `admin@neuriva.tz` and password `admin123`, then open **Admin** in the menu.

> **Change these before going live.** Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` and a long random `JWT_SECRET` in `server/.env`.

## Environment variables

**server/.env**

| Variable | What it is |
|----------|-----------|
| `PORT` | Server port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random text used to sign login tokens |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | First admin account, created on first run |

**client/.env** (optional)

| Variable | What it is |
|----------|-----------|
| `VITE_API_URL` | API address. Default `http://localhost:5000/api` |

## API

Send the token as `Authorization: Bearer YOUR_TOKEN`.

| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/auth/signup`, `/api/auth/login` | Public |
| GET | `/api/courses`, `/api/projects`, `/api/events` | Public |
| POST, PUT, DELETE | `/api/courses`, `/api/projects`, `/api/events` (and `/:id`) | Admin |
| POST | `/api/events/:id/register` | Logged in |
| PUT | `/api/users/me/plan` | Logged in |
| GET | `/api/users` | Admin |
| DELETE | `/api/users/:id` | Admin |
| POST | `/api/contact` | Public |
| GET | `/api/contact` | Admin |
| GET | `/api/stats` | Admin |

## Deploy

1. **Database:** create a free MongoDB Atlas cluster and copy its connection string.
2. **Server:** deploy `server/` on Render or Railway. Add the variables from the table above.
3. **Website:** in `client/`, set `VITE_API_URL` to your server address, run `npm run build`, and upload the `dist` folder to Netlify or Vercel.

## Roadmap

- [ ] Real enrollment records for courses
- [ ] Server-side API keys (the admin tab only stores keys in the browser for now)
- [ ] Image uploads for projects and the logo
- [ ] Payments for the Pro and Premium plans
- [ ] Tests

## Author

Built by **Ye (Mathias Ben Ngilangwa)**, Mbeya, Tanzania. [@U77Y](https://github.com/U77Y)

## License

MIT, see [LICENSE](LICENSE).
