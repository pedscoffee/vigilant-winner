# Pediatric Clinical Dashboard

Desktop Electron app for building pediatric outpatient note text blocks (HPI, ROS, Exam, Assessment, Plan) with an offline, clipboard-first workflow.

## Overview

Pediatric Clinical Dashboard is a local-only phrase builder designed for fast note assembly. It combines reusable templates with interactive tab builders and keeps a live output panel ready to paste into your EHR.

Core behavior:
- Runs fully offline (no network dependency in normal use).
- Keeps an always-on-top floating window for quick access.
- Auto-copies output to clipboard (can be disabled).
- Persists all user data in local JSON files under Electron `userData`.

## Features

- Tab workflows:
- `A&P`: searchable diagnosis/plan library with add/edit/delete and note insertion.
- `Sick`: complaint-driven HPI/ROS/Exam assembly and diagnosis suggestions.
- `Well`: age-based milestones, guidance, immunizations, screenings, growth/BMI phrasing.
- `Exam`: normal/abnormal/omit per system with quick abnormal findings.
- `ROS`: per-system positive/negative/omit phrase builder.
- `Inbox`: reusable response templates with token replacement and refill helpers.
- `Scribe Helpers`: placeholder tab + correction rules in Settings.

- Productivity tools:
- Command palette for A&P and inbox snippets.
- Local and global shortcuts (toggle window, command palette, entry hotkeys).
- Live output panel with manual copy, clear, and auto-copy debounce.

- Settings:
- Output order, labels, headers, and separator style.
- Exam default included systems.
- Shortcut configuration visibility.
- Known find/replace corrections applied to final output.
- Backup export/import.

## Tech Stack

- Electron
- React 18
- Zustand
- Vite
- Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm

### Install

```bash
npm install
```

### Run in Development

```bash
npm run dev
```

This starts:
- Vite dev server for renderer (`http://localhost:5173`)
- Electron process pointed at that dev server

### Run Packaged App Locally

```bash
npm run build
npm start
```

## Build and Distribute

- Build renderer only:

```bash
npm run build
```

- Build unpacked Electron bundle:

```bash
npm run pack
```

- Build installers:

```bash
npm run dist
```

Configured targets:
- macOS: `dmg`
- Windows: `nsis`

## Scripts

- `npm run dev` - run renderer + Electron for local development
- `npm run dev:renderer` - run Vite renderer only
- `npm run dev:electron` - run Electron against local Vite server
- `npm run build` - build renderer (`dist/`)
- `npm start` - start Electron (expects built renderer in production mode)
- `npm run lint` - run ESLint
- `npm run pack` - build + electron-builder unpacked output
- `npm run dist` - build + electron-builder installer output

## Data and Persistence

Default seed files live in [`data/`](/Users/caleb/Documents/GitHub/vigilant-winner/data):
- `wellVisit.json`
- `sickVisit.json`
- `examFindings.json`
- `apLibrary.json`
- `inbox.json`
- `corrections.json`
- `preferences.json`

On first app launch, these are copied into:
- `app.getPath('userData')/userData`

All edits are saved to the copied userData JSON files, not the repo defaults.

## Shortcuts

Defaults:
- Toggle dashboard visibility: `CommandOrControl+Shift+N`
- Open command palette: `Control+Space`
- Local clear output: `Escape`

You can customize shortcuts in Settings, including per-entry hotkeys in A&P/Inbox data.

## Backup and Restore

Use **Settings -> Backup/Restore** to:
- Export a JSON bundle of all dashboard data
- Import a previously exported bundle

## Project Structure

- [`electron/`](/Users/caleb/Documents/GitHub/vigilant-winner/electron) - main process, IPC, window/tray, data store
- [`src/`](/Users/caleb/Documents/GitHub/vigilant-winner/src) - renderer app (tabs, components, state)
- [`data/`](/Users/caleb/Documents/GitHub/vigilant-winner/data) - default JSON content seeded on first run
- [`dist/`](/Users/caleb/Documents/GitHub/vigilant-winner/dist) - Vite build output

## Notes

- This repository currently has no automated test suite configured.
- The app is intended for local clinical drafting workflows; validate final wording and compliance requirements in your environment.
