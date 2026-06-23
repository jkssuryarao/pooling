# RideShare — Demo Login Credentials

**App:** Tally Solutions RideShare (mobile web demo)

---

## Employee accounts

| Employee ID | Password | Name | Role |
|-------------|----------|------|------|
| `EMP-0012` | `RideShare@2025` | Priya Joshi | Employee |
| `EMP-0042` | `RideShare@2025` | Rahul Kumar | Employee |
| `EMP-0003` | `RideShare@2025` | Sunita Acharya | Employee |
| `EMP-0099` | `Admin@2025` | Anita Sharma | Admin |

All employee logins have access to: Home, Search, Post ride, My rides, Messages, Notifications, Profile.
Admin also has access to the Admin dashboard (`/admin`).

---

## Running the app (static — no backend required)

```bash
npm install
npm run build        # produces static site in out/
npx serve out        # serve locally, or deploy out/ to any static host
```

Open the served URL — you will be redirected to `/login`.

No `.env.local` or server process is required. The app runs entirely in the browser.

---

## Development

```bash
npm run dev          # Next.js dev server with Turbopack (localhost:3000)
```

---

## Admin: importing employees via CSV

Admins can bulk-add employees from the Admin dashboard using a CSV file.

**Required columns (header row):**

```csv
employeeId,name,email,department,homeLocality,gender,password
EMP-0100,New Person,new@tally.com,Engineering,HSR Layout,MALE,RideShare@2025
```

- **Required:** `employeeId`, `name`, `email`, `department`, `homeLocality`, `gender` (MALE or FEMALE)
- **Optional:** `password` — defaults to `RideShare@2025` if omitted
- Duplicate Employee IDs are skipped with an error message
- Imported users can immediately log in with their Employee ID and password

---

## Notes

- All data (rides, users, messages, credentials) is stored in browser `localStorage`.
- Use Profile → Reset demo data to restore ride/message defaults (does not reset imported users).
- Credentials are visible in the client bundle — this is a demo, not production auth.
- Dynamic routes (e.g. `/rides/[id]`) are pre-built for seed data only. Client-side navigation to newly created rides works; deep-linking may 404 on static hosts.
