# instaQuote

<br />

<p align="center">
  <img width="125" alt="instaQuote" src="./frontend/src/assets/logo/logo.png" />
  <div align="center">Instantly make business quotations.</div>
  <div align="center">
    <a href="https://insta-quote-six.vercel.app" target="_blank">
      <img src="https://custom-icon-badges.demolab.com/badge/Visit%20instaQuote-7352f7.svg?logo=link-external&logoColor=white" />
    </a>
  </div>
</p>

#

## Overview

instaQuote is an internal RFQ and quotation management tool for market research project teams. It helps project managers create Korea and overseas RFQs, calculate CPI, sales, and gross margin, manage draft and submitted quotations, track statuses, and search vendor/rate-card data without manually moving between spreadsheets.

The current application pairs a native React/Vite frontend with a Google Apps Script backend. The frontend provides dashboard, create, draft, list, vendor, and privacy pages, while Apps Script reads and writes Google Sheets data, generates quotation documents in Google Drive, and exposes a JSON API for the React app.

<br />

> [!NOTE]
> This project was originally developed internally under a different name. It has since been rebranded to **instaQuote**, with all proprietary data and company-specific styling removed for public release. In addtion, instaQuote was originally built entirely on Google Apps Script with JavaScript/jQuery, HTML, and CSS. The frontend was later migrated into a React and TypeScript application deployed through Vercel, while Apps Script remained as the Google Workspace API layer.

[Open legacy Apps Script deployment](https://script.google.com/macros/s/AKfycbyJ0eTtcaAqfjWalilv59jp274zS502FEdmbEi-1EPlZrTFoQ-LrbbCju8iY1FqTeyO/exec)  
Google login and project-specific Google Workspace permissions may be required.

<br />

## My Role

- Designed the original workflow and UI/UX for RFQ creation, quotation review, and status tracking.
- Built the Google Apps Script backend that integrates with Google Sheets, Google Drive, Gmail/OAuth utilities, and quotation templates.
- Rebuilt the frontend as native React route components with TypeScript, Vite, Tailwind CSS, TanStack Query, and reusable page/table components.
- Implemented Korea and overseas RFQ creation flows, draft handling, RFQ list management, vendor search, dashboard metrics, and quotation export actions.
- Added structured filtering, pagination, detail drawers, status updates, note/output URL updates, bilingual UI state, and frontend API adapters for the Apps Script backend.

<br />

## Screenshots/Demo

<table align="center">
  <tr><td align="center" colspan="2">Home</td></tr>
  <tr>
    <td><img alt="main_sidebar" src="https://github.com/user-attachments/assets/0bcd0174-7ebf-4ac2-be1b-f221e6ec52b6" />
</td>
    <td><img alt="main_dash" src="https://github.com/user-attachments/assets/59cd4773-ed05-4d59-ad2f-1500577fbcc0" />
</td>
  </tr>
  <tr>
    <td align="center">Sidebar</td>
    <td align="center">Dashboard</td>
  </tr>
</table>

<table align="center">
  <tr><td align="center" colspan="2">RFQ List</td></tr>
  <tr>
    <td><img alt="list_filter3" src="https://github.com/user-attachments/assets/5348cdf1-dbc5-4a88-94ce-decc08026758" /></td>
    <td><img alt="list_offcanvas" src="https://github.com/user-attachments/assets/59d9a693-d349-4c67-85db-2afab27c5868" /></td>
  </tr>
  <tr>
    <td align="center">Filters & Update</td>
    <td align="center">Summary</td>
  </tr>
</table>



<br />

## Notable Features

### RFQ Creation

- Korea and overseas RFQ modes with a persistent KR/OS switch.
- CPI, sales, GM, GM percentage, programming fee, overlay fee, and other fee calculations.
- Rate-card driven CPI lookup using IR, LOI, client, country, and completion-point inputs.
- Overseas multi-country RFQ creation with country panels, vendor assignment, country subtotals, and final totals.
- Draft save, draft load, RFQ update, save, export, and save-export flows.
- Quotation document generation through Google Drive templates.

### Dashboard And Tracking

- Overview metrics for Korea and overseas RFQs.
- Date-range controls for recent and yearly performance views.
- Ordered rate, order progress charting, and owner workload snapshots.
- RFQ list and draft list tables with search, date filtering, client/owner/status filters, pagination, and detail drawers.
- Inline status updates, notes updates, and output URL updates.

### Vendor And Reference Data

- Vendor list table with country, LOI, IR, and vendor-type filtering.
- Quick links to RFQ list, overseas RFQ list, vendor list, and country-code Google Sheets.
- Client, country, rate-card, other-fee, completion-point, vendor, and link datasets loaded from the Apps Script backend.

### Google Workspace Integration

- Google Sheets is used as the operational datastore for RFQs, drafts, vendors, clients, rates, and reference lists.
- Google Drive stores and generates quotation documents from templates.
- Apps Script OAuth utilities support Google APIs for Sheets, Drive, Gmail, Cloud Platform, and Storage scopes.
- The current React UI uses local email-title suggestions by default for privacy, while the legacy Apps Script backend still includes Gmail API support.

<br />

## Architecture


<img width="1672" height="941" alt="image" src="https://github.com/user-attachments/assets/f264ab76-1532-42de-a056-ceb6937c1b29" />


<br />

## Tech Stack

**Frontend**

![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript_6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router_7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![TanStack Table](https://img.shields.io/badge/TanStack_Table-FF4154?style=for-the-badge)
![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**Backend And Google Workspace**

![Google Apps Script](https://img.shields.io/badge/Google_Apps_Script-4285F4?style=for-the-badge&logo=googleappsscript&logoColor=white)
![Google Sheets](https://img.shields.io/badge/Google_Sheets-34A853?style=for-the-badge&logo=googlesheets&logoColor=white)
![Google Drive](https://img.shields.io/badge/Google_Drive-4285F4?style=for-the-badge&logo=googledrive&logoColor=white)
![Gmail](https://img.shields.io/badge/Gmail-EA4335?style=for-the-badge&logo=gmail&logoColor=white)
![OAuth](https://img.shields.io/badge/OAuth-555555?style=for-the-badge)

<br />

## Project Structure

```txt
frontend/               React, TypeScript, Vite, Tailwind app
frontend/src/App.tsx    Route definitions for dashboard, create, draft, list, vendor, privacy
frontend/src/lib/api.ts Apps Script API client
frontend/src/pages/     Main route pages and feature-specific hooks/components
frontend/src/components Shared layout, UI, table, and feedback components
backend/                Google Apps Script source files
backend/[GET]Code.js    GET API handlers and legacy HTML web app routing
backend/[POST]Code.js   RFQ save, update, draft, export, and mutation handlers
backend/oauth_utilities.js
```

<br />

## Routes

```txt
/          Dashboard
/create    Create or edit RFQs and drafts
/draft     Draft RFQ list
/list      Submitted RFQ list
/vendor    Overseas vendor list
/privacy   Privacy policy
/index     Redirects to /
```

The KR/OS RFQ mode is controlled inside the app and persisted in local storage.

<br />

## Environment

Create the frontend environment file:

```bash
cd frontend
cp .env.example .env
```

Configure the deployed Apps Script web app URL:

```txt
VITE_BACKEND_API_BASE=https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec
```

<br />

## Run Locally

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open:

```txt
http://localhost:5173
```

When `VITE_BACKEND_API_BASE` is configured, local API calls are proxied by Vite to the Apps Script deployment.

<br />

## Useful Commands

Frontend:

```bash
cd frontend
npm run build
npm run preview
npm run tailwind:canonical:check
```

Backend deployment with clasp:

```bash
cd backend
clasp push
clasp deploy
```

<br />

## API Notes

The React app calls Apps Script in API mode:

```txt
GET  <VITE_BACKEND_API_BASE>?api=1&fn=<name>&args=<json-array>
POST <VITE_BACKEND_API_BASE> with api=1 and form-encoded RFQ fields
```

Supported GET functions include:

```txt
getActiveUserEmail
getActiveUserName
getLink
getGmailEmails
getCountry
getClient
getOtherFee
getCompPt
getRate
getRFQ
getDraft
getRFQOS
getDraftOS
getVendors
getFilteredRFQ
getRFQStatusInfo
getRFQOverview
getMergedRFQOS
```

Supported POST actions are selected by `Last submit type`:

```txt
save
save-draft
update
export
save-export
update-status
update-comments
update-outputurl
```

<br />

## Deployment Notes

The Apps Script project runs on the V8 runtime, uses the Asia/Seoul timezone, and executes as the user accessing the web app. Advanced Google services are enabled for Sheets, Gmail, and Drive.

The React frontend can be deployed as a static Vite build. The deployment must provide `VITE_BACKEND_API_BASE` at build time or set `window.__INSTAQUOTE_BACKEND_API_BASE__` at runtime before the app loads.
