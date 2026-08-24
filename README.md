# The Case File — Criminal Record Management System

A full rewrite of the original Tkinter + MySQL desktop app as a web app:

- **Backend:** FastAPI, storing everything in local JSON files (no database to
  host or pay for).
- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS.
- **Face recognition:** your browser's webcam captures photos, the FastAPI
  backend detects faces (OpenCV Haar cascade) and trains/matches an LBPH
  recognizer — the same technique the original desktop app used, just moved
  server-side so it works from a browser instead of a local camera window.

```
project/
├── backend/    FastAPI app (Python)
└── frontend/   Next.js app (TypeScript)
```

---

## 1. Run it locally

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # then edit JWT_SECRET at least
python seed_data.py             # creates demo data in ./data

uvicorn app.main:app --reload --port 8000
```

The API is now at `http://localhost:8000`. Interactive docs at
`http://localhost:8000/docs`.

Demo logins created by `seed_data.py`:

| Role   | Email                          | Password |
|--------|---------------------------------|----------|
| Admin  | krrish@gmail.com                | 123      |
| Center | aroramanavarora8@gmail.com      | 123      |

### Frontend

```bash
cd frontend
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev
```

Visit `http://localhost:3000`.

---

## 2. How the data storage works

Every "table" from the old MySQL database is now a JSON file under
`backend/data/` (created automatically the first time you run the app):

- `admins.json`, `centers.json`, `categories.json`, `locations.json`,
  `criminals.json`, `remarks.json`, `reports.json`

Uploaded criminal photos live in `backend/uploads/criminals/`. Webcam photos
captured for face-recognition training live in `backend/uploads/dataset/<criminal_id>/`,
and the trained model is written to `backend/uploads/models/`.

This is intentionally simple — good for a small deployment on a free hosting
tier. Reads/writes are guarded by an in-process lock so concurrent requests
don't corrupt a file, but it isn't built for high write concurrency. If you
outgrow it, `backend/app/storage.py` is the only file that would need to be
swapped for a real database client — every router just calls
`storage.<collection>.get/insert/update/delete/find`, so the rest of the app
wouldn't need to change.

**Important:** the `data/` and `uploads/` folders are where all your actual
records live. Whichever host you use, make sure that folder is either on a
persistent disk/volume, or back it up — a typical free container filesystem
is wiped on every redeploy.

---

## 3. Deploying for free

A reasonable free-tier split:

- **Frontend → Vercel** (native Next.js support, generous free tier).
- **Backend → Render or Railway** (free/low-cost Python web service).

### Backend (Render example)

1. Push this repo to GitHub.
2. On Render: New → Web Service → point at the repo, root directory `backend`.
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env.example` (set a real `JWT_SECRET`,
   and set `CORS_ORIGINS` to your Vercel URL once you have it).
6. **Persistent storage:** Render's free tier has an ephemeral filesystem —
   data written to `backend/data` and `backend/uploads` will be lost on
   redeploy/restart. Add a Render Disk (a few hundred MB is plenty) mounted
   at `/opt/render/project/src/backend/data` and another at
   `.../backend/uploads`, or point `DATA_DIR` / `UPLOADS_DIR` env vars at a
   mounted disk path. Railway's volumes work the same way. Without a
   persistent disk, treat this as a demo deployment only.
7. Run `python seed_data.py` once (Render's shell, or a one-off job) if you
   want the demo accounts.

### Frontend (Vercel)

1. New Project → import the repo → set root directory to `frontend`.
2. Environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`
3. Deploy. Vercel auto-detects Next.js — no other config needed.
4. Go back to your backend's `CORS_ORIGINS` env var and add the Vercel URL,
   then redeploy the backend.

### A note on the webcam features

Browsers only allow camera access (`getUserMedia`) on `https://` origins (or
`localhost`). Vercel gives you HTTPS automatically, so the Face ID capture
and Face Scan pages will work once deployed — just make sure your backend
URL is also HTTPS (Render/Railway give you this by default) so the browser
doesn't block mixed-content requests.

---

## 4. Project structure

### Backend (`backend/`)

```
app/
├── main.py           FastAPI app, CORS, static file mount for /uploads
├── config.py          Paths, JWT settings, CORS origins
├── storage.py          JSON "database" (Collection class: get/insert/update/delete/find)
├── security.py         Password hashing, JWT creation/verification, validators
├── schemas.py           Pydantic request/response models
├── deps.py               Auth dependencies (get_current_user, require_admin, etc.)
├── face_service.py        Webcam-frame face detection, LBPH training & recognition
└── routers/
    ├── auth.py            /auth/admin/login, /auth/center/login, /auth/me, /auth/change-password
    ├── admins.py           /admins (Super Admin only)
    ├── categories.py        /categories
    ├── locations.py          /locations, /locations/states (static state→city list)
    ├── centers.py             /centers
    ├── criminals.py            /criminals (CRUD, photo upload, capture/train/recognize)
    ├── remarks.py               /remarks
    ├── reports.py                /reports
    └── dashboard.py               /dashboard/stats
seed_data.py    One-time script to populate demo data
```

### Frontend (`frontend/`)

```
app/
├── page.tsx                     Landing page (choose Admin/Center)
├── login/admin, login/center     Login pages
├── admin/                          Admin portal (dashboard, criminals, scan,
│                                     categories, locations, centers, admins,
│                                     remarks, reports, change-password)
└── center/                         Center portal (dashboard, criminals + add
                                      remark, my remarks, change-password)
components/
├── layout/AppShell.tsx    Sidebar + top-level page frame
├── WebcamCapture.tsx        getUserMedia camera capture, used for both
│                              Face ID training and the Face Scan tool
├── ChangePasswordForm.tsx
└── ui/                          Button, Field (Input/Select/TextArea), Card,
                                    Modal, Notice, StampBadge
lib/
├── api.ts    Fetch wrapper (adds auth header, handles 401s, JSON/FormData)
├── types.ts   Shared TypeScript interfaces matching the backend schemas
└── useAuth.ts  useRequireAuth() — client-side route guard by role
```

---

## 5. Roles & permissions

- **Super Admin** — everything, plus manage other Admins.
- **Admin** — manage criminal records, categories, locations, centers,
  remarks, reports; cannot manage other admins.
- **Center** — view criminal records, add/edit/delete their own remarks,
  file reports; cannot create/edit/delete criminal records or manage centers.

All of this is enforced on the backend (`app/deps.py` role dependencies), not
just hidden in the UI.

---

## 6. What changed from the original desktop app

- MySQL → JSON files (no database server or hosting cost).
- Tkinter windows → Next.js pages with the same workflows (add/search/edit/
  delete criminals, categories, locations, centers, admins; log remarks;
  file reports; change password).
- Local-webcam face capture (`cv2.VideoCapture` on the machine running the
  app) → browser webcam capture (`getUserMedia`) that uploads frames to the
  backend, which runs the same Haar-cascade + LBPH pipeline server-side.
- Plaintext passwords in the database → bcrypt-hashed passwords.
- Two "criminal" tables in the old schema (`criminal` and `criminals`) were
  merged into one `criminals` collection with a consistent set of fields.
