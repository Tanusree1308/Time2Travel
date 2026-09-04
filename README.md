# Time2Travel — Modern React Prototype

College-project MVP for the Hyperlocal Micro-Window Pricing Detector.

## Run

```bash
npm install
npm run dev
```

Open the localhost URL printed by Vite.

## Included
- React + Vite
- Serif editorial design system from the supplied prompt
- Playfair Display + Source Sans 3 + IBM Plex Mono
- Ivory / rich black / burnished gold palette
- Responsive layouts
- Destination search
- Hyperlocal signal cards
- Best day-part recommendation
- Time-window comparison
- Save places
- Visit history
- Crowd feedback loop
- Prototype sign-in screen

## Database note
The login and profile interactions in this version are intentionally prototype-only. They do not store real passwords or send user data anywhere.

For a real college-project implementation, connect:
- Firebase Authentication for sign-in/sign-up
- Firestore for user profiles, saved places, visit history and feedback
- A backend/API for the ML prediction service

Suggested Firestore collections:
users/{userId}
visits/{visitId}
savedPlaces/{savedPlaceId}
feedback/{feedbackId}
searchHistory/{searchId}
