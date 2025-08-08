## NovaMail — Premium Dark Email App

Elegant dark-mode email UI built with React + Vite + TypeScript + Tailwind. Includes a realistic layout (sidebar, search top bar, list, detail view) and a floating composer, powered by mock data so it runs instantly.

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

### Tech

- React 18, TypeScript, Vite
- Tailwind with premium dark surfaces and gradients
- Lucide icons, Inter font

### Structure

- `src/App.tsx` – composition of core layout
- `src/components/` – `Sidebar`, `TopBar`, `MailList`, `MailView`, `Composer`
- `src/mockEmails.ts` – mock dataset

### Notes

This is a frontend-only demo. Connect your email provider API or a backend to make it fully functional.


