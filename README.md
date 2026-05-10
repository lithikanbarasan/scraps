# Scraps

Scraps is a pantry management and food waste reduction platform designed for college students. The app helps users track ingredients, discover recipes based on available food, identify expiring items, and coordinate ingredient sharing with friends to reduce unnecessary grocery waste.

## Features

* Pantry-based recipe recommendations
* Expiration-aware ingredient tracking
* Community pantry and ingredient sharing
* Recipe filtering and search
* AWS-powered ingredient image recognition
* Favorite recipes and cooking history
* Responsive mobile-first interface

---

## Tech Stack

### Frontend

* Next.js 
* React
* TypeScript
* Tailwind CSS

### APIs & Services

* AWS Rekognition
* TheMealDB API


## Getting Started

Clone the repository:

```bash
git clone https://github.com/your-username/scraps.git
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


## Environment Variables

Create a `.env.local` file in the project root:

```env
AWS_REGION=your_region
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```
