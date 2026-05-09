# Scraps 🥬 — Food Waste Reduction App

A social food waste reduction app built with Next.js, React, TypeScript, and Tailwind CSS.

## Setup

```bash
npx create-next-app@latest scraps-app --typescript --tailwind --app
cd scraps-app
```

Copy the contents of `src/` into your project's `src/` folder.

## File Structure

```
src/
├── app/
│   └── page.tsx              # Next.js entry point
├── components/
│   ├── ScrapsApp.tsx         # Main app shell + tab router
│   └── tabs/
│       ├── PantryDashboard.tsx   # Pantry list with urgency colors
│       ├── AddIngredient.tsx     # Manual entry + photo scan
│       ├── Recipes.tsx           # Recipe recommendations
│       ├── Social.tsx            # Friends board
│       └── Profile.tsx           # Profile + notifications
├── types.ts                  # All TypeScript interfaces
└── mockData.ts               # Sample data (replace with Firebase/Supabase)
```

## Connecting Your Backend

### Firebase / Supabase
Replace `mockData.ts` imports in `ScrapsApp.tsx` with real Firestore/Supabase queries:

```ts
// Firebase example
import { collection, getDocs } from "firebase/firestore";
const snapshot = await getDocs(collection(db, "ingredients"));
const ingredients = snapshot.docs.map(doc => doc.data() as Ingredient);
```

### OpenAI API (photo scan)
In `AddIngredient.tsx`, replace `handleSimulateScan` with a real API call:

```ts
const response = await fetch("/api/scan", {
  method: "POST",
  body: formData, // image file
});
const { name, emoji, suggestedExpiry } = await response.json();
```

Create `src/app/api/scan/route.ts`:
```ts
import OpenAI from "openai";
export async function POST(req: Request) {
  const openai = new OpenAI();
  // Send image to GPT-4 Vision
  // Return { name, emoji, suggestedExpiry }
}
```

## Key Logic

- **Auto-sharing**: Items with `daysLeft <= 2` automatically set `autoShared: true`
  and appear on the Friends board
- **Urgency levels**: red = ≤2 days, yellow = 3–5 days, green = 6+ days
- **Red items float to top** of the Pantry dashboard automatically (sorted by `daysLeft`)
- **Badge counts** on nav tabs: red badge on Pantry = urgent items, Profile = unread notifications

## Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase or Supabase (auth + database + storage)
- **AI**: OpenAI GPT-4 Vision (ingredient scanning)
- **Push notifications**: Firebase Cloud Messaging or Expo (if going native)
