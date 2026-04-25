# frontend (native React)

This frontend is now implemented as native React route components (no iframe page rendering).

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- react-router-dom (path-based routes)

## Routes implemented

- `/`
- `/Create-KR`
- `/Create-OS`
- `/List-KR`
- `/List-OS`
- `/Draft-KR`
- `/Draft-OS`
- `/Status-KR`
- `/Status-OS`
- `/Dash-KR`
- `/Dash-OS`
- `/Vendor-OS`
- `/privacy-policy`
- `/OpenUrl`

## Backend integration

The app calls the GAS backend API mode:

- `GET <VITE_BACKEND_API_BASE>?api=1&fn=<name>&args=<json-array>`

Configured by:

```bash
VITE_BACKEND_API_BASE=https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec
```

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
