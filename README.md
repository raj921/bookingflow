# Tickete booking flow

Small Nuxt booking flow for the Tickete take-home.

## Run

```bash
npm install
TICKETE_API_KEY=your_key npm run dev
```

Open `http://localhost:3000` for experience `101`, or `http://localhost:3000/106` to see the sold-out state.

## Notes

- The API key stays server-side in `TICKETE_API_KEY`.
- The slots API currently returns `remaining` as either a number or a pax-type map, so the app normalizes both.
- With more time I would add a tiny end-to-end test around the booking path and tune mobile gesture details on a real phone.
