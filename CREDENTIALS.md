# RideShare — Demo Login Credentials

**App:** Tally Solutions RideShare (mobile web demo)

---

## Employee account (seeker + poster)

| Field | Value |
|-------|-------|
| Employee ID | `employee` |
| Password | `RideShare@2025` |
| Access | Home, Search, Post ride, My rides, Messages, Notifications, Profile |

## Admin account (HR / IT)

| Field | Value |
|-------|-------|
| Employee ID | `admin` |
| Password | `Admin@2025` |
| Access | Everything above + Admin dashboard (`/admin`) |

---

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to `/login`.

Copy `.env.example` to `.env.local` (already configured for local dev).

---

## Vercel environment variables

| Variable | Value |
|----------|-------|
| `AUTH_SECRET` | random 32+ character string |
| `AUTH_EMPLOYEE_USER` | `employee` |
| `AUTH_EMPLOYEE_PASS` | `RideShare@2025` |
| `AUTH_ADMIN_USER` | `admin` |
| `AUTH_ADMIN_PASS` | `Admin@2025` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | same as `AUTH_SECRET` |

---

## Notes

- SSO button is visual only in v1.
- Mock data persists in browser `localStorage` — use Profile → Reset demo data to restore defaults.
- No phone numbers or emails are shown between users.
