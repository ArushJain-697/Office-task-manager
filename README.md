# Sicari.works

> **Sicari.works is a full-stack, role-based matching platform disguised as an underground Las Vegas job board.**
> Beneath the thematic UI lies a robust Node.js and Express backend engineered for secure data isolation and complex state management. It connects Fixers (job posters) with Sicarios (applicants) using a custom server-side matching engine. By computing the array intersection between a candidate's defined skills and a job's strict requirements, the system generates a weighted fit_score and dynamically sorts the payload before the API responds.
>
> Built with a zero-trust approach, the architecture implements HttpOnly JWT authentication, strict Zod schema validation for all incoming payloads, and parameterized MySQL queries to eliminate injection vulnerabilities, all deployed on Railway behind Cloudflare's Layer 7 protection.

Live at **[sicari.works](https://sicari.works)** and API at **[api.sicari.works](https://api.sicari.works)**

<p>
  <img src="https://img.shields.io/badge/REACT-4A739C?style=for-the-badge&logo=react&logoColor=white" height="32" alt="React">
  <img src="https://img.shields.io/badge/VITE-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" height="32" alt="Vite">
  <img src="https://img.shields.io/badge/NODE.JS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" height="32" alt="Node.js">
  <img src="https://img.shields.io/badge/EXPRESS.JS-000000?style=for-the-badge&logo=express&logoColor=white" height="32" alt="Express.js">
  <img src="https://img.shields.io/badge/MYSQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" height="32" alt="MySQL">
  <img src="https://img.shields.io/badge/CLOUDINARY-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" height="32" alt="Cloudinary">
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" height="32" alt="JWT">
  <img src="https://img.shields.io/badge/RAILWAY-131415?style=for-the-badge&logo=railway&logoColor=white" height="32" alt="Railway">
  <img src="https://img.shields.io/badge/CLOUDFLARE-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" height="32" alt="Cloudflare">
</p>

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite, React Router, Typed.js |
| Backend | Node.js, Express.js |
| Database | MySQL 8.0 — Railway |
| Images | Cloudinary — 3 isolated folders |
| Auth | JWT in HttpOnly cookies |
| Validation | Zod — fixed 20-skill vocabulary |
| Security | helmet, bcrypt, cors, sanitize-html |
| Infra | Railway CI/CD, Cloudflare (DDoS, SSL, Layer 7) |

---

## Flagship Feature — Matching Engine

Array intersection of sicario skills vs heist required roles → weighted fit score (0–100%) computed server-side. Heist feed sorted before response. Score stored on application for fixer review. Never exposed to sicario.

```mermaid
flowchart TD
    A[Sicario applies to heist] --> B[Fetch sicario skills]
    B --> C[Fetch heist required_skills]
    C --> D[Array intersection]
    D --> E[matched / total × 100 = fit_score]
    E --> F[Stored in applications table]
    F --> G[Heist feed sorted DESC server-side]
    F --> H[Fixer sees applicants ranked by fit_score]
    G --> I[Sicario never sees fit_score]

    style A fill:#1a1a1a,stroke:#8B0000,color:#fff
    style D fill:#8B0000,stroke:#8B0000,color:#fff
    style E fill:#8B0000,stroke:#8B0000,color:#fff
    style F fill:#2a2a2a,stroke:#555,color:#ccc
    style G fill:#1a1a1a,stroke:#555,color:#ccc
    style H fill:#1a1a1a,stroke:#c0a000,color:#c0a000
    style I fill:#1a1a1a,stroke:#555,color:#888
```

---

## Application Lifecycle

```mermaid
stateDiagram-v2
    [*] --> pending : sicario applies (fit_score calculated + stored)
    pending --> accepted : fixer accepts
    pending --> rejected : fixer rejects
    accepted --> accepted : heist status open/closed
    rejected --> rejected : cannot re-apply
    pending --> pending : other sicarios still apply
    accepted --> [*] : heist crew finalized
    rejected --> [*]

    note right of pending : sicario sees status, fit_score hidden
    note right of accepted : fixer ranked applicants by fit_score DESC

    classDef blood fill:#8B0000,color:#fff,stroke:#8B0000
    classDef gold fill:#1a1a1a,color:#c0a000,stroke:#c0a000
    classDef dead fill:#1a1a1a,color:#555,stroke:#333

    class pending blood
    class accepted gold
    class rejected dead
```

---

## Security

| Layer | Implementation |
|---|---|
| HttpOnly JWT | JS cannot access token — XSS proof |
| bcrypt 12 rounds | Auto-upgrades legacy plaintext on login |
| Role-based access | checkRole() on every protected route |
| Parameterized queries | Zero string concat — SQL injection proof |
| Zod validation | req.body validated before controller. Role is strict enum |
| sanitize-html | All user input stripped before DB insert |
| helmet + CORS | Express fingerprint hidden, origin whitelisted |
| Edge Guard | x-edge Cloudflare secret — ready to enable |

---

## API Routes

### /api/auth

| Method | Route | Description |
|---|---|---|
| POST | /register | role: sicario or fixer |
| POST | /login | role must match registered role |
| POST | /logout | clears JWT cookie |
| POST | /check-user | username exists check |
| GET | /me | logged-in user info |

### /api/posts

| Method | Route | Description |
|---|---|---|
| GET | / | feed — upvotes, downvotes, score, my_vote |
| POST | /add | content (req), title (opt), photo (file, opt) |
| POST | /:id/vote | reddit-style toggle — 1 or -1 |

### /api/sicario

| Method | Route | Description |
|---|---|---|
| GET | /profile | own profile + connection_count |
| PUT | /profile | update profile + optional photo |
| GET | /heists | open heists sorted by fit score |
| POST | /apply/:heistId | one-click apply |
| GET | /applications | own applications + status |

### /api/fixer

| Method | Route | Description |
|---|---|---|
| GET | /profile | own profile + connection_count |
| PUT | /profile | update profile + optional photo |
| POST | /heist/add | post heist — up to 3 photos |
| GET | /heists | own heists only |
| GET | /heist/:id/applicants | applicants ranked by fit_score |
| PATCH | /application/:id | accepted or rejected |

### /api/connections

| Method | Route | Description |
|---|---|---|
| POST | /request/:userId | send request |
| PATCH | /:id/accept | receiver only |
| PATCH | /:id/decline | receiver only |
| DELETE | /:id | unfriend or withdraw |
| GET | / | accepted connections |
| GET | /pending | incoming requests |
| GET | /sent | outgoing requests |

### /api/profile

| Method | Route | Description |
|---|---|---|
| GET | /:username | public profile — includes connection_status and connection_count |

connection_status values: none · sent · received · connected · declined

---

## Getting Started

Clone the repo and install dependencies for both client and server.

**Backend**

    cd server
    npm install
    npm run dev      # nodemon — development
    npm start        # production

**Frontend**

    cd client
    npm install
    npm run dev      # Vite dev server
    npm run build    # production build

Create a .env file in server/ with the following variables:

    MYSQLHOST=
    MYSQLPORT=3306
    MYSQLUSER=
    MYSQLPASSWORD=
    MYSQLDATABASE=
    JWT_SECRET=
    CLOUDINARY_CLOUD_NAME=
    CLOUDINARY_API_KEY=
    CLOUDINARY_API_SECRET=
    PORT=8080
    NODE_ENV=production
    FRONTEND_URL=https://sicari.works

Tables are auto-created on first run via initDatabase(). No migration scripts needed.


---

*Built at IIIT Bangalore — Hacknite.*

- Ayaan Sharma (BC2025017)
- Arush Kumar Jain (BC2025013)
- Yug Porwal (BC2025121)

---

*Started as random whiteboard scribbles, turned into long "bhai this won't work" debates and somehow ended up as a system that actually does.*
