# Click Rush



A full-stack 60-second click speed game with user accounts, score tracking, and leaderboards. Built with Node.js/Express backend, MySQL database, and a static HTML/CSS/JS frontend — all served from a single Railway deployment.

## Live Demo

```
https://click-rush-production.up.railway.app
```
```
https://www.loom.com/share/1eb1baed4633420998541e9e699da943
```
---
###[Click Rush](https://click-rush-production.up.railway.app)

###[Github REPO ](https://github.com/ISHMEETSINGHSODHI/Click-Rush)

###[loom features video link ]([https://click-rush-production.up.railway.app](https://www.loom.com/share/1eb1baed4633420998541e9e699da943))

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express |
| Database | MySQL via `mysql2/promise` connection pool |
| Auth | `express-session` + `bcryptjs` password hashing |
| Frontend | Static HTML/CSS/JS served from `/public` |
| Hosting | Railway (backend + database + frontend — all in one) |

---

## Project Structure

```
Click-Rush/
├── server.js                   # Entry point — serves frontend + mounts API routes
├── package.json
├── .gitignore
├── db/
│   ├── connection.js           # MySQL connection pool (reads Railway env vars)
│   └── schema.sql              # Table definitions — run once on Railway MySQL
├── routes/
│   ├── auth.js                 # POST register / login / logout, GET profile
│   ├── score.js                # POST score — saves score + returns ranks
│   └── leaderboard.js          # GET global / weekly / daily leaderboards
└── public/                     # Static frontend files
    ├── index.html
    ├── login.html
    ├── register.html
    ├── game.html
    ├── leaderboard.html
    ├── profile.html
    ├── style.css
    └── js/
        ├── utils.js            # Shared: getCurrentUser, requireLogin, logout, updateNav
        ├── index.js            # index.html controller — dark mode, guest/user banner
        ├── auth.js             # Login + register form handling
        ├── game.js             # Click counter, timer, score submission
        ├── leaderboard.js      # Fetch + display leaderboard tabs
        └── profile.js          # Display user stats + score history
```

---

## Script Load Order

`utils.js` must be loaded first on every page as all other scripts depend on it.

```html
<!-- index.html -->
<script src="js/utils.js"></script>
<script src="js/index.js"></script>
<script src="js/game.js"></script>

<!-- login.html + register.html -->
<script src="js/utils.js"></script>
<script src="js/auth.js"></script>

<!-- leaderboard.html -->
<script src="js/utils.js"></script>
<script src="js/leaderboard.js"></script>

<!-- profile.html -->
<script src="js/utils.js"></script>
<script src="js/profile.js"></script>
```

---

## Database Schema

Two tables defined in `db/schema.sql`. Run each statement separately on Railway's MySQL Query tab.

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | INT, PK, auto-inc | |
| `username` | VARCHAR(50) UNIQUE | |
| `email` | VARCHAR(100) UNIQUE | |
| `hex_id` | VARCHAR(255) | bcrypt-hashed password |
| `created_at` | TIMESTAMP | defaults to now |

### `scores`

| Column | Type | Notes |
|---|---|---|
| `id` | INT, PK, auto-inc | |
| `user_id` | INT | FK → `users.id`, cascades on delete |
| `score` | INT | number of clicks in 60 seconds |
| `played_at` | TIMESTAMP | defaults to now |

Indexes on `scores.user_id`, `scores.played_at`, and `scores.score DESC` keep leaderboard queries fast.

---

## API Endpoints

All routes are mounted under `/api`.

### Auth — `routes/auth.js`

| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/register` | Create account (`username`, `email`, `hexId`). Auto-logs in on success. | No |
| POST | `/api/login` | Log in with `email` + `hexId`. | No |
| POST | `/api/logout` | Destroy current session. | Session |
| GET | `/api/profile` | Returns username, email, join date, best score, total games, last 20 scores. | Session |

### Leaderboard — `routes/leaderboard.js`

| Method | Route | Description |
|---|---|---|
| GET | `/api/leaderboard/global` | Top 50 by best score all time |
| GET | `/api/leaderboard/weekly` | Top 50 by best score in last 7 days |
| GET | `/api/leaderboard/daily` | Top 50 by best score in last 24 hours |

Each entry returns `{ rank, username, score }`.

### Score — `routes/score.js`

| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/score` | Save score + return ranks | Session |

**Request body:**
```json
{ "score": 42 }
```

**Response:**
```json
{
  "message": "Score saved",
  "score": 42,
  "globalRank": 3,
  "weeklyRank": 5,
  "dailyRank": 1
}
```

Weekly/daily rank returns `"-"` if the user has no scores in that time window.

### Health Check

```
GET /health → { "status": "Click Rush is running ✅" }
```

---

## Frontend Pages

Served as static files from `/public` with clean URL routes in `server.js`:

| URL | File |
|---|---|
| `/` | `public/index.html` |
| `/login` | `public/login.html` |
| `/register` | `public/register.html` |
| `/game` | `public/game.html` |
| `/leaderboard` | `public/leaderboard.html` |
| `/profile` | `public/profile.html` |

---

## Railway Deployment

### Environment Variables

Set these in Railway → your backend service → Variables tab:

| Variable | Set by |
|---|---|
| `MYSQLHOST` | Railway auto (MySQL plugin) |
| `MYSQLPORT` | Railway auto (MySQL plugin) |
| `MYSQLUSER` | Railway auto (MySQL plugin) |
| `MYSQLPASSWORD` | Railway auto (MySQL plugin) |
| `MYSQLDATABASE` | Railway auto (MySQL plugin) |
| `SESSION_SECRET` | Set manually — any long random string |
| `NODE_ENV` | Set manually — `production` |

### Deploy Steps

1. Push code to GitHub (`main` branch)
2. Railway → New Project → Add MySQL database
3. Run `db/schema.sql` queries one at a time in Railway MySQL → Query tab
4. Railway → New → GitHub Repo → select `Click-Rush`
5. Link MySQL variables to backend service via "Add Variable Reference"
6. Add `SESSION_SECRET` and `NODE_ENV=production` manually
7. Click Deploy → Settings → Networking → Generate Domain

### Update Anytime

Edit any file on GitHub → Commit changes → Railway redeploys automatically in ~30 seconds.

---

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Create a `.env` file

```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=any_local_secret_string

MYSQLHOST=localhost
MYSQLPORT=3306
MYSQLUSER=root
MYSQLPASSWORD=your_password
MYSQLDATABASE=clickrush
```

### 3. Set up the database

Create the database then run the schema:

```bash
mysql -u root -p -e "CREATE DATABASE clickrush;"
mysql -u root -p clickrush < db/schema.sql
```

### 4. Start the server

```bash
node server.js
# or for auto-reload during development:
npm run dev
```

App runs at `http://localhost:3000`. Frontend and API are on the same origin — no separate frontend server needed.

---

## Known Issues & Fixes

### 1. `requireLogin()` not awaited in `profile.js`

`requireLogin()` is async but was called without `await`, returning a Promise (always truthy) instead of the user object — meaning guest redirect never fired and `user.username` was undefined.

**Fix:**
```js
// ❌ Wrong
document.addEventListener("DOMContentLoaded", function () {
  const user = requireLogin();
  if (!user) return;
});

// ✅ Fixed
document.addEventListener("DOMContentLoaded", async function () {
  const user = await requireLogin();
  if (!user) return;
});
```

### 2. Session MemoryStore warning

Railway logs show:
```
Warning: connect.session() MemoryStore is not designed for a production environment
```

This works fine for single-instance deployments. For scaling, replace with a persistent session store such as `connect-redis` or `express-mysql-session`.

---

## Offline / localStorage Mode

All frontend JS files (`auth.js`, `game.js`, `leaderboard.js`, `profile.js`) contain commented-out offline localStorage blocks. These can be uncommented to run the game without a backend — useful for local testing without a database.
