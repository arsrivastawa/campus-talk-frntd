# CampusTalk Frontend

CampusTalk is a web application designed to help college students connect and chat anonymously with fellow students. The frontend is built with React, TypeScript, Vite, and Tailwind CSS, providing a modern, responsive, and interactive user experience.

## Features

- **Anonymous Random Matching:** Get paired with another student for one-on-one conversations.
- **Text Chat:** Secure, real-time text messaging with random peers.
- **Video Chat:** Face-to-face video calls using WebRTC technology.
- **Mode Selection:** Choose between text or video chat modes.
- **Safe and Private:** No personal information is required to start chatting.
- **Modern UI:** Responsive design with smooth transitions and accessible components.

## Project Structure

```
frontend/
├── public/                # Static assets
├── src/
│   ├── components/        # React components (UI, chat, video, etc.)
│   ├── hooks/             # Custom React hooks (WebRTC, Socket.io)
│   ├── lib/               # Utility libraries
│   ├── pages/             # Main pages (Index, NotFound)
│   ├── App.tsx            # Main app component and routing
│   ├── main.tsx           # App entry point
│   └── index.css          # Tailwind CSS and custom styles
├── package.json           # Project metadata and dependencies
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or bun (for package management)

### Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```

### Running the Development Server
Start the frontend in development mode:
```bash
npm run dev
# or
bun run dev
```
The app will be available at [http://localhost:8080](http://localhost:8080).

### Building for Production
To build the app for production:
```bash
npm run build
# or
bun run build
```
The output will be in the `dist/` directory.

## Usage
1. Open the app in your browser.
2. Click "Start Chatting" to begin.
3. Choose between Text Chat or Video Chat.
4. Get matched with a random student and start chatting.
5. You can disconnect or find a new match at any time.

## Technologies Used
- **React** (with TypeScript)
- **Vite** (build tool)
- **Tailwind CSS** (utility-first CSS framework)
- **Socket.io** (real-time communication)
- **WebRTC** (video chat)
- **Radix UI** (accessible UI components)
- **React Router** (routing)
- **TanStack React Query** (data fetching and caching)
- **ESLint** (linting)

## Architecture Overview
- **App.tsx:** Sets up global providers (React Query, tooltips, notifications) and routing.
- **Index.tsx:** Main page logic for state transitions (landing, mode selection, chat modes).
- **LandingPage:** Welcome screen and introduction.
- **ModeSelection:** Lets users pick between text and video chat.
- **ChatInterface:** Handles real-time text chat using Socket.io.
- **VideoChat:** Manages video calls and chat using WebRTC and Socket.io.
- **Hooks:**
  - `useSocket`: Manages Socket.io connection and events.
  - `useWebRTC`: Handles WebRTC peer connections and media streams.
- **Styling:** Tailwind CSS with custom configuration for theming and animations.

## Customization
- **Theming:** Modify `tailwind.config.ts` and `index.css` for custom colors and styles.
- **Component Aliases:** See `components.json` for import path aliases.

## Acknowledgments
- [shadcn/ui](https://ui.shadcn.com/) for UI inspiration and components.
- [Radix UI](https://www.radix-ui.com/) for accessible UI primitives.
- [Socket.io](https://socket.io/) and [WebRTC](https://webrtc.org/) for real-time communication.
