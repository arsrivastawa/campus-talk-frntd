# Randomize Frontend

**Randomize** is a web application that allows users to connect and chat anonymously with random peers via text or video. The frontend is built using **React**, **TypeScript**, **Vite**, and **Tailwind CSS**, offering a fast, responsive, and engaging user experience.

## Features

* **Anonymous Matching:** Get instantly connected with a random stranger for one-on-one interaction.
* **Text Chat:** Real-time, secure messaging using Socket.IO.
* **Video Chat:** Face-to-face conversations via WebRTC with peer-to-peer media streams.
* **Chat Mode Selection:** Choose between text-only or video chat before connecting.
* **Private and Safe:** No login, no personal data — just spontaneous anonymous chat.
* **Modern UI:** Fully responsive, keyboard-accessible UI with smooth animations and transitions.

## Project Structure

```
randomize-frontend/
├── public/                # Static assets
├── src/
│   ├── components/        # Reusable UI and functional components
│   ├── hooks/             # Custom hooks for WebRTC and Socket.IO logic
│   ├── lib/               # Shared utilities and helpers
│   ├── pages/             # Page-level views (Landing, Chat, etc.)
│   ├── App.tsx            # Global providers and route definitions
│   ├── main.tsx           # Entry point
│   └── index.css          # Tailwind and custom styles
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite build configuration
├── tailwind.config.ts     # Tailwind theme and plugin setup
├── postcss.config.js      # PostCSS setup
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project documentation
```

## Getting Started

### Prerequisites

* Node.js (v18+ recommended)
* npm or bun (as package manager)

### Installation

```bash
git clone <repo-url>
cd randomize-frontend
npm install
# or
bun install
```

### Running in Development

```bash
npm run dev
# or
bun run dev
```

App will be accessible at [http://localhost:8080](http://localhost:8080)

### Build for Production

```bash
npm run build
# or
bun run build
```

Output will be generated in the `dist/` directory.

## Usage

1. Open the app in your browser.
2. Click “Start Chatting.”
3. Select between Text or Video mode.
4. Get matched with a random peer and start chatting.
5. You can disconnect or match again anytime.

## Technologies Used

* **React** (TypeScript)
* **Vite** (lightning-fast bundler)
* **Tailwind CSS** (utility-first styling)
* **Socket.IO** (WebSocket-based communication)
* **WebRTC** (real-time video)
* **Radix UI** (accessible UI primitives)
* **React Router** (routing)
* **TanStack React Query** (caching & data layer)
* **ESLint + Prettier** (code quality and formatting)

## Architecture Overview

* **App.tsx:** Root setup with providers and route management.
* **Index.tsx:** Main UX flow controller (landing → mode selection → chat).
* **LandingPage:** Intro screen and entry point.
* **ModeSelection:** Choose chat mode (text/video).
* **ChatInterface:** Manages Socket.IO text chat.
* **VideoChat:** Manages WebRTC video calls + signaling.
* **Hooks:**

  * `useSocket`: Establishes and handles WebSocket connections.
  * `useWebRTC`: Sets up peer connections, ICE negotiation, and media streams.
* **Styling:** Tailwind-based design with custom theme support and animations.
