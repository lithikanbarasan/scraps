# Scraps

Scraps is a smart pantry management and food waste reduction platform designed for college students. The app helps users track ingredients, discover recipes based on available food, identify expiring items, and coordinate ingredient sharing with roommates and friends to reduce unnecessary grocery waste.

## Features

* **AI-Assisted Photo Scanner:** Snap a photo of your fridge, pantry, or grocery cart to automatically detect ingredients, quantities, and estimated grocery costs using Gemini Vision AI.
* **Expiration-Aware Tracking:** Real-time urgency tracking with dynamic shelf-life estimation and automated expiration alerts.
* **Pantry-Based Recipe Recommendations:** Smart recipe discovery filtering by ingredients you already have on hand.
* **Community Pantry & Food Sharing:** Seamlessly share surplus or expiring items with friends before they go bad.
* **Supabase Authentication & Persistence:** Secure user profiles, real-time data syncing, and shared pantry states.
* **Responsive Mobile-First Interface:** Modern Tailwind UI tailored for mobile web and desktop.

---

## Tech Stack

### Frontend

* Next.js (App Router)
* React 19
* TypeScript
* Tailwind CSS

### Backend & Database

* Supabase (PostgreSQL, Authentication, Row Level Security)
* Vercel

### APIs & Services

* Google Gemini 2.5 Flash Vision API (`@google/genai`)
* TheMealDB API

---

## Getting Started

Clone the repository:

```bash
git clone [https://github.com/your-username/scraps.git](https://github.com/your-username/scraps.git)
cd scraps
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=[https://your-project.supabase.co](https://your-project.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Project Structure

```text
scraps/
├── app/
│   ├── api/
│   │   └── ingredients/
│   │       └── detect/        # Gemini 2.5 Flash Vision API endpoint
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AddIngredient.tsx       # Manual & AI camera scan review flow
│   ├── PantryDashboard.tsx     # Urgency filters & pantry management
│   ├── PhotoScannerCapture.tsx # HTML5 canvas compression & upload
│   └── Recipes.tsx             # Recipe search & matching
└── lib/
    ├── imageBase64.ts         # Client-side base64 helpers
    └── supabaseClient.ts      # Supabase database initialization
```
