# NotedIQ — Setup Guide

## Final Project Structure

```
NOTEDIQ/
├── .gitignore
├── SETUP.md
│
├── client/
│   ├── public/
│   │   └── index.html          ← entry HTML
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx     ← left panel (mode, source, presets)
│   │   │   ├── TopBar.jsx      ← tab bar + status indicator
│   │   │   ├── NoteBlock.jsx   ← renders all block types
│   │   │   ├── StudentView.jsx ← notebook canvas / concepts / riddles
│   │   │   └── EmployeeView.jsx← MoM sheet + Kanban tasks
│   │   ├── App.jsx             ← root, socket logic, state
│   │   |── index.css           ← Tailwind + custom animations
│   |   └──index.js                ← ReactDOM entry
│   ├── package.json
│   ├── vite.config.js          ← NEW (was missing)
│   ├── postcss.config.js       ← NEW (was missing)
│   ├── tailwind.config.js      ← UPDATED
│   └── tsconfig.json           ← FIXED (5 errors corrected)
│
└── server/
    ├── server.js               ← Express + Socket.io (port 5000)
    ├── studentProcessor.js     ← acoustic + semantic pipeline for students
    ├── corporateProcessor.js   ← acoustic + semantic pipeline for employees
    ├── package.json
    ├── .env                    ← copy from .env.example
    └── .env.example
```

---

## Quick Start

### 1 — Server
```bash
cd server
cp .env.example .env        # edit MONGO_URI if needed
npm install
npm run dev                 # nodemon server.js → localhost:5000
```

### 2 — Client
```bash
cd client
npm install
npm run dev                 # vite → localhost:3000
```

Open **http://localhost:3000**

> MongoDB is optional — server runs without it, just skips session saving.

---

## Socket Events

| Event | Direction | Payload |
|---|---|---|
| `select-role` | Client → Server | `"student"` \| `"employee"` |
| `role-confirmed` | Server → Client | `{ role }` |
| `incoming-audio-stream` | Client → Server | `{ text: string }` |
| `processed-notes-stream` | Server → Client | `{ role, original, corrected, blocks[], timestamp }` |

## Block Types

**Student:** `heading` · `definition` · `example` · `exam-alert` · `note`

**Employee:** `decision` · `task-item` (includes `assignee` field)
