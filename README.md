The Case File — Criminal Record Management System

A full rewrite of the original Tkinter + MySQL desktop application as a modern web application.

The system provides separate Admin and Center portals for managing criminal records, categories, locations, centers, remarks, reports, and browser-based face recognition.

Backend: FastAPI + Firebase Firestore
Frontend: Next.js 14 + TypeScript + Tailwind CSS
Authentication: JWT + Firebase service-account integration
Database: Firebase Firestore
File Storage: Cloudinary
Face Recognition: OpenCV Haar Cascade + LBPH
Deployment: Vercel
project/
├── backend/     FastAPI backend
└── frontend/    Next.js frontend
1. Features
Criminal Records
Create criminal records
Search criminal records
View criminal details
Update criminal information
Delete criminal records
Upload and replace criminal photographs
Associate criminal records with categories
Store family and contact information
Face Recognition
Browser-based webcam capture
Face detection using OpenCV Haar Cascade
Capture multiple training images
Store training images in Cloudinary
Train an LBPH face recognizer
Store trained model files in Cloudinary
Recognize faces from browser webcam images
Match recognized faces against criminal records
Administration
Admin authentication
Center authentication
Role-based access control
Administrator management
Center management
Category management
Location management
Remarks management
Reports management
Dashboard statistics
Password changes
2. Technology Stack
Backend
Python
FastAPI
Firebase Admin SDK
Firebase Firestore
PyJWT
Passlib
bcrypt
OpenCV
NumPy
Cloudinary
Pydantic
Frontend
Next.js 14
React
TypeScript
Tailwind CSS
Lucide React
React Hot Toast
Infrastructure
Vercel
Firebase Firestore
Cloudinary
3. Run Locally
Backend
cd backend
python3 -m venv venv
source venv/bin/activate

Windows:

venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

Create a .env file:

JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=480

CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_CLIENT_ID=your-client-id

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

FACE_MATCH_CONFIDENCE_THRESHOLD=60

Start the backend:

uvicorn app.main:app --reload --port 8000

The API will be available at:

http://localhost:8000

Interactive API documentation:

http://localhost:8000/docs
4. Frontend
cd frontend
npm install

Create .env.local:

NEXT_PUBLIC_API_URL=http://localhost:8000

Start the development server:

npm run dev

Open:

http://localhost:3000
5. Database

The application uses Firebase Firestore as its database.

Current collections include:

admins
centers
categories
locations
criminals
remarks
reports
_sequences

The backend provides a storage abstraction in:

backend/app/storage.py

Routers interact with Firestore through:

storage.criminals.get(...)
storage.criminals.insert(...)
storage.criminals.update(...)
storage.criminals.delete(...)
storage.criminals.find(...)
storage.criminals.all()

This keeps Firestore-specific operations separated from the API routers.

6. File Storage

The application uses Cloudinary for persistent file storage instead of relying on the Vercel filesystem.

Criminal photographs

Criminal photographs are stored in Cloudinary.

Face dataset

Captured face-training images are stored under:

face_dataset/
└── <criminal_id>/
    ├── 1
    ├── 2
    ├── 3
    └── ...
Face recognition model

The trained model and label mapping are stored under:

face_models/
├── face_trainer.yml
└── labels.json

This allows the face-recognition system to work with Vercel's serverless environment without depending on persistent local files.

7. Face Recognition Architecture

The original desktop application used a local OpenCV webcam.

The web version uses the browser camera.

Capture

The browser uses:

navigator.mediaDevices.getUserMedia()

Captured frames are converted to base64 images and sent to FastAPI.

Face Detection

FastAPI uses:

OpenCV Haar Cascade

to detect the largest face.

The detected face is converted to grayscale and resized to:

200 × 200
Training

Training images are retrieved from Cloudinary.

The backend trains:

LBPHFaceRecognizer

and generates:

face_trainer.yml
labels.json

These files are uploaded to Cloudinary.

Recognition
Browser webcam
       ↓
Base64 image
       ↓
FastAPI
       ↓
Haar Cascade
       ↓
LBPH recognizer
       ↓
Criminal ID
       ↓
Firestore
       ↓
Criminal record
8. Authentication

The backend uses JWT-based authentication.

After successful login, the API generates an access token.

The frontend sends the token using:

Authorization: Bearer <token>

Authentication and authorization are handled through:

backend/app/security.py
backend/app/deps.py

Firebase Firestore provides persistent application data, while JWT remains the API authentication mechanism.

9. Roles & Permissions
Super Admin

A Super Admin has full system access and can additionally:

Create administrators
Manage administrators
Delete administrators
Manage centers
Manage criminal records
Manage categories
Manage locations
Manage remarks
Manage reports
Use face recognition
View dashboard
Change password
Admin

An Admin can:

View dashboard
Manage criminal records
Manage categories
Manage locations
Manage centers
Manage remarks
Manage reports
Use face recognition
Change password

An Admin cannot manage other administrators.

Center

A Center can:

View criminal records
Add remarks
Edit their own remarks
Delete their own remarks
File reports
View relevant information
Change password

A Center cannot:

Create criminal records
Edit criminal records
Delete criminal records
Manage categories
Manage locations
Manage centers
Manage administrators

All permissions are enforced by the backend.

10. API Structure
Authentication
/auth/admin/login
/auth/center/login
/auth/me
/auth/change-password
Administrators
/admins
Centers
/centers
/centers/{id}
Categories
/categories
Locations
/locations
/locations/states
Criminals
/criminals
/criminals/{id}
/criminals/{id}/photo
/criminals/{id}/capture
/criminals/train
/criminals/recognize
Remarks
/remarks
Reports
/reports
Dashboard
/dashboard/stats
11. Project Structure
Backend
backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── firebase.py
│   ├── cloudinary.py
│   ├── storage.py
│   ├── security.py
│   ├── schemas.py
│   ├── deps.py
│   ├── face_service.py
│   │
│   └── routers/
│       ├── auth.py
│       ├── admins.py
│       ├── categories.py
│       ├── locations.py
│       ├── centers.py
│       ├── criminals.py
│       ├── remarks.py
│       ├── reports.py
│       └── dashboard.py
│
├── seed_data.py
├── requirements.txt
└── .env
Frontend
frontend/
├── app/
│   ├── page.tsx
│   ├── login/
│   │   ├── admin/
│   │   └── center/
│   ├── admin/
│   └── center/
│
├── components/
│   ├── layout/
│   │   └── AppShell.tsx
│   ├── WebcamCapture.tsx
│   ├── ChangePasswordForm.tsx
│   └── ui/
│
├── lib/
│   ├── api.ts
│   ├── types.ts
│   └── useAuth.ts
│
└── package.json
12. Environment Variables
Backend
JWT_SECRET=
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=480

CORS_ORIGINS=

FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_CLIENT_ID=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

FACE_MATCH_CONFIDENCE_THRESHOLD=60
Frontend

Local development:

NEXT_PUBLIC_API_URL=http://localhost:8000

Production:

NEXT_PUBLIC_API_URL=https://criminaal-backend.vercel.app

Never expose backend secrets using NEXT_PUBLIC_* environment variables.

13. Deployment

The application is deployed as two separate Vercel applications.

                  ┌─────────────────────┐
                  │       Browser       │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Next.js / Vercel    │
                  │ Frontend            │
                  └──────────┬──────────┘
                             │ HTTPS
                             ▼
                  ┌─────────────────────┐
                  │ FastAPI / Vercel    │
                  │ Backend             │
                  └──────┬─────────┬────┘
                         │         │
                ┌────────▼───┐ ┌───▼──────────┐
                │ Firestore  │ │  Cloudinary  │
                │ Database   │ │ File Storage  │
                └────────────┘ └──────────────┘
Frontend

Production environment variable:

NEXT_PUBLIC_API_URL=https://criminaal-backend.vercel.app
Backend

Production environment variables:

JWT_SECRET
JWT_ALGORITHM
JWT_EXPIRE_MINUTES

CORS_ORIGINS

FIREBASE_PROJECT_ID
FIREBASE_PRIVATE_KEY_ID
FIREBASE_PRIVATE_KEY
FIREBASE_CLIENT_EMAIL
FIREBASE_CLIENT_ID

CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

FACE_MATCH_CONFIDENCE_THRESHOLD
CORS

Production:

CORS_ORIGINS=https://criminal-management.vercel.app

For local development as well:

CORS_ORIGINS=https://criminal-management.vercel.app,http://localhost:3000,http://127.0.0.1:3000

After changing Vercel environment variables, redeploy the affected application.

14. Serverless Storage Architecture

The application does not rely on the Vercel filesystem for persistent application data.

Persistent data is stored in:

Firebase Firestore
        ↓
Application records

Files are stored in:

Cloudinary
        ↓
Criminal photographs
Face dataset
Face recognition model
Label mappings

Temporary files required during face-model training are created only during processing and removed afterwards.

This makes the storage architecture suitable for serverless deployment.

15. Webcam Requirements

Browser camera access requires a secure context.

Production:

https://criminal-management.vercel.app

Local development:

http://localhost:3000

The user must grant camera permission to the browser.

16. Security

The application includes:

JWT authentication
Role-based authorization
bcrypt password hashing
Backend-side permission enforcement
CORS configuration
Environment-based secrets
Firebase service-account authentication
Cloudinary authenticated uploads
No frontend exposure of backend secrets

Never commit:

.env
.env.local
Firebase private keys
Cloudinary API secrets
JWT secrets

to Git.

17. What Changed From the Original Desktop Application

The original application used:

Tkinter
MySQL
Local webcam
Local filesystem

The new web application uses:

Next.js
FastAPI
Firebase Firestore
Cloudinary
Browser webcam
OpenCV
LBPH
Vercel
Database
MySQL
   ↓
Firebase Firestore
Interface
Tkinter
   ↓
Next.js + Tailwind CSS
Webcam
cv2.VideoCapture()
   ↓
Browser getUserMedia()
File Storage
Local filesystem
   ↓
Cloudinary
Face Recognition

The original Haar Cascade + LBPH approach has been retained, but the workflow has been adapted for browser-based capture and serverless deployment.

18. Production URLs
Frontend
https://criminal-management.vercel.app
Backend
https://criminaal-backend.vercel.app
Backend Health Check
https://criminaal-backend.vercel.app/

Expected response:

{
  "status": "ok",
  "service": "criminal-record-management-api"
}
API Documentation
https://criminaal-backend.vercel.app/docs
19. Demo Accounts
Role	Email	Password
Admin	krrish@gmail.com	123
Center	aroramanavarora8@gmail.com	123

These accounts are intended for development/testing.

Do not use simple demo credentials for a production deployment containing real records.

20. Future Improvements

Potential improvements include:

Firebase Authentication
Modern deep-learning face recognition
Liveness detection / anti-spoofing
Face embeddings
Pagination for large datasets
Advanced criminal-record search
Audit logs
Fine-grained permissions
Automated backups
Rate limiting
Production monitoring
Automated tests
CI/CD
Improved model accuracy
License

This project is intended for educational and project-development purposes.
