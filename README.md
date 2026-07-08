# nsywnails

Elegant, minimal booking site for a gel manicure studio. Built with Next.js (App Router)
+ Tailwind CSS, deployable to Vercel for free.

## How booking works

1. You (the owner) log into `/admin` and add open slots (date + time) each month.
2. Clients visit `/book`, pick an open slot, their length + design tier, and submit their
   name, phone, and Instagram username.
3. You get a text message the moment someone requests a slot.
4. You review it in `/admin` and hit **Approve** or **Deny**.
   - Approve → the slot is locked in as booked.
   - Deny → the slot re-opens for someone else.
5. Client sends their $5 deposit via Zelle (626-295-8572) — shown on the confirmation screen.
   The booking form automatically shows the remaining balance due day-of (total minus the $5
   deposit already paid).

No online payments are processed by the site itself — the deposit is a manual Zelle transfer,
matching how you already do it.

## Project structure

```
app/
  page.js              → homepage
  services/page.js      → pricing page
  book/page.js           → client-facing booking flow
  admin/page.js           → password-protected dashboard
  api/slots               → public: list open slots
  api/book                 → public: submit a booking request
  api/admin/*                → private: manage slots + approve/deny bookings
lib/
  pricing.js    → all prices live here — edit this file to change pricing
  kv.js          → data storage (Vercel KV)
  sms.js          → text notifications (Twilio)
  auth.js          → simple admin password/session
components/
  Nav.js, Footer.js, SwatchTier.js (the nail-swatch tier picker)
```

## 1. Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The site will run, but booking/admin features need the services
below configured first.

## 2. Deploy to Vercel

1. Push this folder to a new GitHub repo.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import that repo.
3. Click **Deploy** (default settings work — it auto-detects Next.js).

### Set up storage (required for slots/bookings to save)

In your Vercel project → **Storage** tab → **Create Database** → choose **KV** → connect it
to this project. Vercel automatically adds the `KV_REST_API_URL` and `KV_REST_API_TOKEN`
environment variables for you — no copy/pasting needed.

### Set your admin password

Project → **Settings** → **Environment Variables** → add:

```
ADMIN_PASSWORD = (a password only you know)
```

This is what you'll type at `yoursite.com/admin`.

### Set up text notifications (optional but recommended)

1. Sign up at [twilio.com](https://twilio.com) (free trial credit included).
2. Buy a phone number (~$1/month).
3. From your Twilio console, grab your **Account SID** and **Auth Token**.
4. Add these environment variables in Vercel:

```
TWILIO_ACCOUNT_SID   = ...
TWILIO_AUTH_TOKEN    = ...
TWILIO_FROM_NUMBER   = +1XXXXXXXXXX   (the Twilio number you bought)
TWILIO_TO_NUMBER     = +16262958572   (your personal cell)
```

If you skip this step, the site still works — you just won't get a text, so check
`/admin` periodically for new requests.

5. After adding environment variables, redeploy (Vercel → Deployments → ⋯ → Redeploy).

## 3. Photos

Real Tier 1 and Tier 4 examples are already in `public/images/gallery/`. Tier 2 and Tier 3
currently use a placeholder graphic (labeled "photo coming soon") — swap them out by adding
your own files to `public/images/gallery/` and updating the `gallery` array for that tier in
`lib/pricing.js`.

## 4. Editing prices

Everything lives in `lib/pricing.js` — sizes, tiers, and add-on amounts. Change a number
there and it updates everywhere on the site automatically.

## 5. Monthly workflow

- Go to `/admin`, log in.
- Add each open date/time as a slot.
- Share the link (or your `/book` page) with clients / post to Instagram.
- Approve or deny requests as they come in from `/admin`.
