# MediMatch

AI-powered healthcare navigation for India. Symptom analysis, specialist matching, doctor directory, government health schemes, video consultations, and appointment management — all in one place.

## What it does

- **Symptom Analysis** – Describe symptoms in plain text, voice, or via an interactive 3D body map. Get an AI-driven preliminary assessment, urgency guidance, and specialist recommendations.
- **Doctor Directory** – Search verified specialists, filter by free treatment, city, and specialty, view on map or list, and book appointments.
- **Government Healthcare Schemes** – Discover Central and State government schemes you may be eligible for based on location and need.
- **Video Consultation** – Join secure WebRTC-based video calls directly from your bookings.
- **Appointments & Bookings** – Manage bookings as a patient, or approve, cancel, and complete appointments on the dedicated doctor dashboard.
- **In-App Notifications** – Real-time reminders before appointments, status updates, and system alerts.
- **Multilingual** – Supports English, Hindi, Bengali, Marathi, Punjabi, and more.

## Roles

MediMatch uses role-based access control:

- **Patient** – Search doctors, book appointments, track symptoms, and manage bookings.
- **Doctor** – Review and manage appointments through the doctor dashboard.
- **Admin** – Review and approve/reject doctor registration requests.

## Tech stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Animation & visualization:** Framer Motion, GSAP, Three.js, Recharts, Leaflet
- **Backend / Auth / Database:** Lovable Cloud
- **AI:** Edge functions orchestrated with Gemini
- **Real-time:** WebRTC video calls, realtime notifications

## Getting started

```sh
# Install dependencies
npm install

# Start the dev server
npm run dev
```

## Project structure

```text
src/
├── pages/            # Route pages (Home, Auth, Dashboard, Results, Doctors, etc.)
├── components/       # Reusable UI and feature components
├── hooks/            # Custom React hooks
├── services/         # API / function integrations
├── i18n/              # Translation files and config
├── lib/               # Utility helpers
└── integrations/      # Backend client and generated types
```

## Learn more

- Live preview: available via the Lovable editor
- Production URL: published through Lovable

---

Built with Lovable.
