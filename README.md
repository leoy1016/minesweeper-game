# sweeper

A minimalist, modern web Minesweeper game built with Next.js, TypeScript, and Canvas.

## Features

- **Minimalist Design**: Clean black background with white dots and typewriter font
- **Three Difficulty Levels**: Easy (10×8, 10 mines), Medium (18×16, 40 mines), Hard (24×20, 90 mines)
- **Multiplayer Mode**: Turn-based gameplay with 10-second timer
- **Smooth Animations**: Row-by-row dot spawn, typewriter text effects
- **First Click Safety**: Never hit a mine on your first click
- **Flag Mode**: Toggle flagging with F key or UI button
- **Keyboard Shortcuts**: F for flags, Enter/Space to activate hovered cell

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Font**: Cutive Mono (typewriter style)
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Rendering**: HTML Canvas (not divs/SVG)
- **Testing**: Vitest + Testing Library
- **Realtime**: Supabase (optional) + DevLoopback for local testing

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open** [http://localhost:3000](http://localhost:3000)

## Multiplayer Development

For local multiplayer testing, open two browser tabs/windows and use the same room code. The DevLoopbackProvider simulates both players in the same process.

## Environment Variables (Optional)

For Supabase multiplayer support, create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Without these, the app falls back to the in-memory DevLoopbackProvider.

## Testing

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run
```

## Deployment

The app is ready for Vercel deployment:

1. Push to GitHub
2. Connect to Vercel
3. Deploy automatically

## Game Rules

- **Single Player**: Click dots to reveal, avoid mines
- **Multiplayer**: Turn-based with 10s timer, first to hit mine loses
- **First Click**: Always safe (no mine + no adjacent mines)
- **Flag Mode**: Click flag button or press F to toggle
- **Win**: Reveal all non-mine cells
- **Lose**: Click a mine or timeout (multiplayer)

## Color Scheme

- **Background**: Pure black (#000000)
- **Text**: Off-white (#EDEDED)
- **Safe cells**: Green
- **Mines**: Red (high saturation flash, then low saturation)
- **Numbers**: 1=yellow, 2=orange, 3=red, 4=purple, 5=blue, 6=pink
- **Difficulty colors**: Easy=green, Medium=blue, Hard=red, Multi=yellow

## Architecture

```
app/
  page.tsx                    # Home with mode selection
  game/
    easy|medium|hard/page.tsx # Single player games
    multi/page.tsx            # Multiplayer lobby
    multi/[roomId]/page.tsx   # Multiplayer game
components/
  Header.tsx                  # Site name + navigation
  HUD.tsx                     # Flag toggle + multiplayer timer
  BoardCanvas.tsx             # Canvas renderer
  TypewriterText.tsx          # Animated text component
lib/
  minesweeper/                # Core game logic
  multiplayer/                # Realtime providers
store/
  useGameStore.ts             # Single player state
  useMultiStore.ts            # Multiplayer state
```

## License

MIT