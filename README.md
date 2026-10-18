# FoodLoop

**Rescue surplus food. Fight hunger together.**

FoodLoop is a community food-relief platform that connects surplus food donors (restaurants, banquets, hostels, households) with nearby verified recipient shelters and delivery volunteers — so good food never goes to waste.

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4, TanStack Start + Router
- **Backend:** Supabase (Postgres + Auth + RLS)
- **Mobile:** Capacitor (Android APK)
- **Build:** Vite 8, Vitest

## Getting Started

```sh
npm i
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production web build |
| `npm run build:capacitor` | Build for Capacitor (Android) |
| `npm run test` | Run tests |
| `npm run preview` | Preview production build |

## Roles

- **Food Donor** — List surplus meals from kitchens, restaurants, banquets
- **Recipient Shelter / NGO** — Browse and request available food
- **Delivery Volunteer** — Pick up and deliver meals to shelters

## Database

Supabase powers the backend. Run the migration in the Supabase SQL Editor:

```
supabase/migrations/0001_init.sql
```

Tables: `profiles`, `donors`, `recipients`, `volunteers`, `admins`, `listings`, `reservations`, `notifications`.

## Android APK

```sh
npm run build:capacitor
npx cap sync android
cd android && ./gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

## License

MIT
