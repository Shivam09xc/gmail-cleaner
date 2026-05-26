# Gmail Cleaner 🧹

Saare unread Gmail emails ek click mein mark as read karo.

---

## Step-by-Step Setup Guide

### Step 1 — Files setup karo

```bash
# Project folder mein jao
cd gmail-cleaner

# Dependencies install karo
npm install
```

---

### Step 2 — .env.local file banao

Project root mein `.env.local` naam ki file banao (`.env.example` copy karo):

```bash
cp .env.example .env.local
```

Phir `.env.local` kholo aur apni values daalo:

```env
GOOGLE_CLIENT_ID=tumhara-client-id-yahan
GOOGLE_CLIENT_SECRET=tumhara-client-secret-yahan
NEXTAUTH_SECRET=koi-bhi-random-32-character-string
NEXTAUTH_URL=http://localhost:3000
```

**NEXTAUTH_SECRET generate karne ke liye terminal mein chalao:**
```bash
openssl rand -base64 32
```

---

### Step 3 — Google Cloud Console mein Redirect URI add karo

Google Cloud Console → Credentials → OAuth 2.0 Client → Edit

**Authorized redirect URIs** mein add karo:
```
http://localhost:3000/api/auth/callback/google
```

---

### Step 4 — Local mein chalao (test ke liye)

```bash
npm run dev
```

Browser mein kholo: `http://localhost:3000`

---

## Vercel pe Deploy Karo (Live Website)

### Step 1 — GitHub pe daalo

```bash
git init
git add .
git commit -m "Gmail Cleaner app"
git branch -M main
git remote add origin https://github.com/tumhara-username/gmail-cleaner.git
git push -u origin main
```

### Step 2 — Vercel pe connect karo

1. https://vercel.com pe jao → Login karo (GitHub se)
2. "New Project" → apna `gmail-cleaner` repo select karo
3. "Deploy" dabao

### Step 3 — Environment Variables Vercel pe add karo

Vercel Dashboard → Project → Settings → Environment Variables

Yeh 4 variables add karo:
```
GOOGLE_CLIENT_ID      → Google Cloud ka Client ID
GOOGLE_CLIENT_SECRET  → Google Cloud ka Client Secret
NEXTAUTH_SECRET       → wahi random string jo local mein daali thi
NEXTAUTH_URL          → https://tumhari-vercel-url.vercel.app
```

### Step 4 — Vercel URL Google Console mein add karo

Google Cloud Console → Credentials → OAuth Client → Edit

**Authorized redirect URIs** mein add karo:
```
https://tumhari-vercel-url.vercel.app/api/auth/callback/google
```

### Step 5 — Redeploy karo

Vercel Dashboard → Deployments → "Redeploy" karo

---

## Done! 🎉

Ab tumhari website live hai. Koi bhi:
1. Website khole
2. Google se login kare
3. "Mark all as read" button dabaye
4. Inbox saaf!

---

## Project Structure

```
gmail-cleaner/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   ← Google OAuth
│   │   └── gmail/
│   │       ├── mark-read/route.ts        ← Mark as read API
│   │       └── count/route.ts            ← Unread count API
│   ├── page.tsx                          ← Main UI
│   ├── layout.tsx                        ← App layout
│   └── globals.css                       ← Styles
├── components/
│   └── Providers.tsx                     ← Session provider
├── .env.example                          ← Environment template
└── package.json
```
