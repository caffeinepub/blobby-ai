# Specification

## Summary
**Goal:** Build Blobby AI, a multi-agent AI assistant web app with a premium dark UI, multi-turn chat sessions stored on the backend, intelligent task routing via Puter.js, and live preview of generated apps/games.

**Planned changes:**
- Motoko backend actor with `createSession`, `getSession`, `saveMessage`, `listSessions`, and `deleteSession` functions to persist chat history
- Onboarding/welcome screen (shown once via localStorage) with animated Blobby blob mascot, tagline, and "Start Chatting" button
- Three-panel layout: left sidebar (session list), central chat window, collapsible right preview panel; top bar with Blobby AI logo; footer with "Built by Talha bin Saif"
- Chat message UI with right-aligned indigo user bubbles, left-aligned dark assistant cards with violet glow, task-type pill badges, and markdown rendering with syntax-highlighted code blocks and copy button
- Bottom input bar with attach file, upload image icons, Enter-to-send (Shift+Enter for newline), and 3-dot pulse loading animation
- Intelligent task-type detection (Chat, Reasoning, Code, AppBuild, GameBuild, ImageGen, Vision, Creative, Research) to select the appropriate Puter.js model call
- Puter.js CDN integration for all AI calls (`puter.ai.chat` with full conversation history, `puter.ai.txt2img` for image generation); no API keys required
- App/Game Build feature: auto-opens right panel with sandboxed iframe rendering generated HTML/JS/CSS and a "Download HTML" button
- Image upload with drag-and-drop, thumbnail preview, and base64 vision call inclusion
- Four suggested prompt cards on the empty chat home screen that auto-submit on click
- Full design system: #111118 background, #7C3AED accent, Inter font, subtle floating blob animation, dark gradient cards with violet border glow

**User-visible outcome:** Users can open Blobby AI, start multi-turn AI chat sessions with intelligent task routing, view live previews of generated apps/games, analyze uploaded images, and generate images — all in a premium, calm dark-violet UI with persistent session history.
