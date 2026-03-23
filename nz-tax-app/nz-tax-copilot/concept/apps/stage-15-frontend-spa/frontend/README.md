# NZ Tax Copilot Frontend

React SPA for the NZ Tax Copilot prototype.

## First release mode

This first deploy path runs with authentication disabled so the app can ship without Azure AD B2C.
Reintroduce auth later behind a feature flag / auth mode switch rather than as a hard first-release dependency.

## Local Development

```bash
npm install
npm run dev
# Access at http://localhost:3000

npm run build
```

## Environment

Use `.env.example` as the baseline:
- `VITE_API_URL` for backend API base URL
- `VITE_AUTH_MODE=none` for the current first-release deploy path
