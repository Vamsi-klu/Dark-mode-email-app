## NovaMail — Premium Dark Email App

Elegant email UI built with React + Vite + TypeScript + Tailwind. Realistic layout (sidebar, search top bar, list, detail view) with a floating composer and mock data so it runs instantly.

New in v1.1.0

- Theme toggle: dark, light, and white — persisted across reloads
- Offline, deterministic AI Overview panel (no network calls)
- Premium motion: fade, slide, and pop animations
- Test suite overhaul: unit + integration tests under `tests/**` with 100% coverage for `src/**`
- Preview server configured for LAN access to avoid localhost issues on mobile

### Quickstart

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

3. Build for production:

   ```bash
   npm run build
   npm run preview
   ```

4. Preview on LAN (to test on your phone):

   ```bash
   npx vite preview --host 0.0.0.0 --port 5174
   # then open http://<your-computer-ip>:5174 on your device
   ```

### Tech

- React 18, TypeScript, Vite
- Tailwind with premium dark surfaces and gradients
- Lucide icons, Inter font

### Structure

- `src/App.tsx` – composition of core layout
- `src/components/` – `Sidebar`, `TopBar`, `MailList`, `MailView`, `Composer`
- `src/components/ThemeToggle.tsx` – theme switcher control
- `src/components/ai/AIPanel.tsx` – interactive AI overview panel
- `src/mockEmails.ts` – mock dataset
- `src/lib/ai.ts` – deterministic AI overview utility (fully local)
- `src/lib/theme.ts` – theme helpers: `getInitialTheme`, `applyTheme`

Tests layout:

- `tests/unit/components/*` — component unit tests
- `tests/unit/lib/*` — library unit tests (`filter`, `ai`, `theme`)
- `tests/integration/*` — app-level flows (mailbox switch, search, composer, AI, theme)

### AI Overview

- Open via the "AI Overview" sidebar button.
- Type a prompt to get an instant summary and actionable next steps.
- Adjust the numeric seed to change bullet ordering deterministically.
- Built for reliability: never throws; local-only logic.

### Theming

- Toggle between Dark, Light, and White from the Top Bar.
- Selection is stored in `localStorage` and applied on load.

### Release Notes

v1.1.0

- Add theme toggle (dark/light/white) with persisted state
- Add deterministic offline AI Overview (`src/lib/ai.ts`, `AIPanel`)
- Improve UI polish and animations; composer pop-in and list transitions
- Restructure tests under `tests/**`; reach 100% coverage for `src/**`
- Configure preview for network host to avoid mobile localhost errors

### Notes

This is a frontend-only demo. Connect your email provider API or a backend to make it fully functional.

