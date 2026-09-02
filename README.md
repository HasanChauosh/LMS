# LMS — Project Overview & How It Works

This repository is a simple LMS (Learning Management System) with a React + Vite frontend and a Node + Express backend using MongoDB (Mongoose). This README explains the architecture, main workflows, file mapping, environment variables, and how to run the project locally. It also includes guidance to import diagrams (draw.io / erase.io).

---

## Quick summary
- Frontend: Vite + React. See [frontend](frontend).
- Backend: Node + Express. See [backend](backend).
- Database: MongoDB (Mongoose models under [backend/models](backend/models)).
- Media: Cloudinary for uploads (configured under [backend/configs/cloudinary.js](backend/configs/cloudinary.js)).
- Auth: Clerk (frontend) + backend middleware for protected routes ([backend/middlewares/authMiddleware.js](backend/middlewares/authMiddleware.js)).
- Payments: Stripe webhooks and API calls (handled in controllers and webhooks).

---

## Architecture overview

- The frontend calls the backend API endpoints (REST). The backend handles authentication, business logic (controllers/services), media uploads, and persistence to MongoDB.
- External services used:
  - Cloudinary — media storage
  - Stripe — payments and webhooks
  - Clerk — authentication (OAuth / session tokens)

Core components (high-level):
- `frontend/` — React app with pages and components.
- `backend/server.js` — Express server entry.
- `backend/routes/` — Route definitions (courses, users, educator, webhooks).
- `backend/controllers/` — Request handlers and business logic.
- `backend/models/` — Mongoose models: `Course.js`, `User.js`, `Purchase.js`, `CourseProgress.js`.

See the provided draw.io XML (import into erase.io) or the PlantUML blocks in the `docs/` folder (if present) to visualize architecture and flows.

---

## Main workflows (high level)

1. Student enrollment / purchase
   - Frontend: user clicks `Enroll` or `Buy` on a course.
   - Frontend calls `POST /api/purchase` (or similar) on the backend with courseId and user info.
   - Backend creates a Stripe payment intent and returns client data.
   - Once payment is confirmed (Stripe webhook), backend creates a `Purchase` record and initial `CourseProgress` in MongoDB.

2. Course content upload (Educator)
   - Educator fills the course form and uploads media (multipart request to `POST /api/educator/add-course`).
   - Backend uploads media to Cloudinary, receives media URLs, and stores them in a `Course` document.

3. Playback and progress tracking
   - Student's player (`frontend/src/pages/student/Player.jsx`) loads course content.
   - When the student marks a lecture complete, frontend calls `POST /api/user/update-course-progress` to record progress server-side.

---

## File mapping (important files)
- Backend entry: [backend/server.js](backend/server.js)
- Backend configs: [backend/configs/mongodb.js](backend/configs/mongodb.js), [backend/configs/cloudinary.js](backend/configs/cloudinary.js), [backend/configs/multer.js](backend/configs/multer.js)
- Backend controllers: [backend/controllers/courseController.js](backend/controllers/courseController.js), [backend/controllers/educatorController.js](backend/controllers/educatorController.js), [backend/controllers/userController.js](backend/controllers/userController.js), [backend/controllers/webhooks.js](backend/controllers/webhooks.js)
- Backend middlewares: [backend/middlewares/authMiddleware.js](backend/middlewares/authMiddleware.js)
- Frontend entry: [frontend/src/main.jsx](frontend/src/main.jsx)
- Player page: [frontend/src/pages/student/Player.jsx](frontend/src/pages/student/Player.jsx)
- Frontend context: [frontend/src/context/AppContext.jsx](frontend/src/context/AppContext.jsx)

If you'd like, I can expand this section to include exact exported functions and important routes per controller.

---

## Environment variables

Frontend (.env):

- See [frontend/.env](frontend/.env) — typical variables:
  - `VITE_CLERK_PUBLISHABLE_KEY` — Clerk publishable key
  - `VITE_CURRENCY` — Currency (e.g. USD)
  - `VITE_BACKEND_URL` — Backend base URL (e.g. http://localhost:5000)

Backend (.env) — create a file named `.env` inside `backend/` with values similar to:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lms
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloud-key
CLOUDINARY_API_SECRET=your-cloud-secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
JWT_SECRET=some_secret
```

Add any other secrets (Clerk server keys, third-party secrets) as required by your `/backend/configs` code.

---

## Run locally (development)

1. Start MongoDB (local or Atlas).
2. Start backend

```bash
cd backend
npm install
# start in dev (if using nodemon) or start
npm run dev    # or `npm start` depending on package.json
```

3. Start frontend

```bash
cd frontend
npm install
npm run dev
```

4. Open the frontend dev URL (usually `http://localhost:5173` for Vite). Ensure `VITE_BACKEND_URL` points to your backend.

Notes:
- If authentication requires Clerk configuration, set the client and server keys in `.env` files and follow Clerk docs for localhost testing.
- For Stripe webhook testing, use the Stripe CLI or set webhook endpoint (e.g., `/api/webhooks/stripe`) exposed via ngrok or Vercel webhook configuration.

---

## Diagrams / Visuals

- Use the draw.io XML I provided earlier and import it into erase.io or diagrams.net to see the architecture. In erase.io (PlantUML/draw.io import), paste the XML or upload the `.drawio` file.
- I also provided PlantUML blocks you can paste into PlantUML mode in erase.io for sequence diagrams.

---

## Common API endpoints (examples)

These are representative endpoints based on the repo layout — confirm exact paths in `backend/routes`.

- `GET /api/courses` — list/search courses
- `GET /api/course/:id` — get course by id
- `POST /api/educator/add-course` — educator adds course (multipart/form-data)
- `POST /api/purchase` — create purchase / payment intent
- `POST /api/user/update-course-progress` — mark lecture complete (protected)
- `POST /api/webhooks/stripe` — Stripe webhook receiver

---

## Deployment notes

- Frontend is setup for Vercel or static hosting (see `frontend/vercel.json` and `vite.config.js`).
- Backend can be deployed to Vercel Serverless, Render, Heroku, or similar. If you use serverless, ensure webhooks and long-running uploads are handled correctly (prefer a server or serverless function that supports large payloads or proxy uploads to Cloudinary).

---

## Next steps I can help with
- Add a per-file UML mapping (controllers → functions → endpoints).
- Produce a downloadable `.drawio` file and commit it to `docs/`.
- Add automated `dev` npm scripts and sample `.env.example` files.

If you want any of these, tell me which and I'll add them.

---

Author: Project collaborator
