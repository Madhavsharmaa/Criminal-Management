# The Case File — Criminal Record Management System

A full rewrite of the original Tkinter + MySQL desktop application as a modern web application for managing criminal records, field centers, administrators, remarks, reports, and browser-based face recognition.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI |
| Database | Firebase Firestore |
| Authentication | JWT |
| Password Hashing | bcrypt |
| Face Detection | OpenCV Haar Cascade |
| Face Recognition | OpenCV LBPH |
| File Storage | Cloudinary |
| Deployment | Vercel |

---

## Architecture

```text
                         ┌──────────────────────┐
                         │       Browser        │
                         │  Next.js Frontend    │
                         └──────────┬───────────┘
                                    │ HTTPS
                                    ▼
                         ┌──────────────────────┐
                         │    FastAPI Backend   │
                         │       Vercel         │
                         └───────┬───────┬──────┘
                                 │       │
                    ┌────────────┘       └─────────────┐
                    ▼                                  ▼
          ┌──────────────────┐              ┌──────────────────┐
          │ Firebase         │              │ Cloudinary       │
          │ Firestore        │              │ File Storage     │
          └──────────────────┘              └──────────────────┘
