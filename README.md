# Pediatric Outpatient Clinical Dashboard

Offline Electron + React desktop dashboard for phrase assembly and clipboard-driven Epic paste workflows.

## MVP Included (Phase 1)
- Always-on-top floating window with persisted size/position
- System tray with show/hide and always-on-top toggle
- Global show/hide shortcut (`Cmd/Ctrl+Shift+N`)
- Tab shell for Well, Sick, Exam, ROS, A&P, Inbox, Scribe
- A&P tab with search, category filtering, add/edit/delete entries, append to note
- Output preview docked at bottom with auto-copy (300ms debounce), manual copy, clear
- Local JSON persistence in `userData` directory (created from `data/*.json` defaults)

## Run
1. `npm install`
2. `npm run dev`

## Build
- `npm run dist` for installers

## Data
Default data files live in [`data/`](/Users/caleb/Documents/GitHub/vigilant-winner/data). On first launch, they are copied to Electron `app.getPath('userData')/userData` and edited there.
