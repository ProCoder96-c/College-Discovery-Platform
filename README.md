# CampusSelect 🎓
### College Discovery & Decision-Making Platform MVP

CampusSelect is a production-grade full-stack web platform designed to help students search, compare, and discover engineering and medical institutions in India. The application is backed by a native SQLite database containing **38,376 real colleges, 79,270 courses, 42,960 cutoffs, and 5,483 student reviews** parsed directly from raw CSV data.

**Live Demo URL**: [college-discovery-platform-8f7g.onrender.com](https://college-discovery-platform-8f7g.onrender.com/)

---

## 🏛️ System Architecture

The platform uses a lightweight, modern, zero-dependency data stack:
* **Frontend**: React + TypeScript (Vite-powered SPA) with a premium "Midnight Oceanic" dark-themed glassmorphism interface (Vanilla CSS, interactive animations). Custom client routing is state-driven to prevent reload mismatches in static hosting.
* **Backend**: Node.js + Express REST APIs serving search queries, placement matrices, cutoff comparisons, and user sessions.
* **Database**: Native SQLite using Node.js 24's built-in `node:sqlite` module (zero external packages or C++ binary compilation requirements).
* **Security & Auth**: Password hashing and custom database-backed session token validation built using the native `node:crypto` library.

---

## ✨ Features Implemented

1. **College Listings & Search**:
   * Instant search matching college names, cities, or states.
   * Filter sidebar for state quotas, course streams (CSE, Mechanical, MBBS), minimum ratings, and maximum fees.
   * Full database pagination and sorting (by name, rating, fees, or placements).
2. **College Profile details**:
   * Information panels showing institution overview, courses table, and placement statistics (average and highest LPA packages).
   * User reviews section allowing logged-in students to submit reviews, dynamically recalculating the college's overall rating.
3. **Compare Colleges**:
   * Floating comparison drawer for up to 3 colleges.
   * Side-by-side comparison matrix evaluating fees, ratings, placements, courses list, and branch-wise cutoff ranks.
   * Auto-highlighting badges for best value options (lowest fees, highest package).
4. **Admission Predictor**:
   * Evaluates student exam ranks (JEE Main or NEET) and category (General, OBC, SC, ST).
   * Determines admission likelihood (`High`, `Medium`, `Stretch`) based on historical closing ranks.
5. **Dashboard & Saved Items**:
   * Student profiles with dynamic saved bookmark lists synced to their workspace.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
* Node.js version **>= 22.5.0** (Required for native `node:sqlite` support)
* A local copy of `database.csv` in the root folder (for database seeding)

### 1. Install Dependencies
Run the installation scripts from the workspace root:
```bash
npm run install-all
```

### 2. Seed the Database
Initialize and seed the SQLite database with 38k+ records:
```bash
npm run seed
```
*(Seeding utilizes SQLite transactions to parse and write all 38,000+ colleges and cutoffs in under 10 seconds)*

### 3. Run Development Servers
Start both the backend API and Vite React server concurrently:
```bash
npm run dev
```
* The backend runs on `http://localhost:5000`
* The frontend runs on `http://localhost:3000` (proxied to port 5000 automatically)

---

## 🌐 Production Deployment

The project is pre-configured for containerized deployment (e.g., Render Web Services):

* **Build Command**: `npm run build` (Installs backend/frontend packages and compiles client bundle)
* **Start Command**: `npm start` (Runs a database startup script that auto-seeds SQLite only if the DB is empty, then boots Express)
* **Serving**: Express serves compiled React assets statically from `frontend/dist` and handles wildcard routing to `index.html`.

### Persistent Volume Configuration (Recommended)
Attach a persistent disk to avoid losing user bookmarks and reviews:
1. Mount a disk with **Mount Path** set to `/var/data`.
2. Add an Environment Variable:
   * **Key**: `DB_PATH`
   * **Value**: `/var/data/database.sqlite`

*If volume mounting fails or directory permissions are restricted (`EACCES`), the app automatically logs a warning and falls back to a local project directory database to prevent container boot crashes.*
