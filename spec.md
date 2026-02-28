# Specification

## Summary
**Goal:** Redesign the Blobby AI frontend from a three-panel layout to a ChatGPT-style single-screen mobile layout.

**Planned changes:**
- Remove the three-panel layout (left sidebar, center chat, right preview panel) and replace with a single full-screen layout with `#0D0D0D` background
- Add a full-width top navigation bar with a hamburger menu icon (left), "Blobby AI" title (center), and settings icon (right)
- Implement a slide-in sidebar drawer (hidden by default) that opens on hamburger tap, showing chat history, a "New Chat" button, and a semi-transparent backdrop
- Redesign the welcome/home screen as a vertically centered single-column layout with the Blobby mascot (100×100px) with a slow floating animation, "What can I help with?" heading, and 4 suggestion cards in a 2×2 grid
- Redesign the bottom input bar to be full-width, pinned to the bottom, with placeholder "Message Blobby AI...", retaining all existing input functionality
- When a chat session is active, show a full-height scrollable message list between the top bar and input bar, preserving existing ChatMessage styling
- Replace the right-panel preview for App/Game builds with a full-screen modal overlay including the "Download HTML" button and a close button
- Apply color scheme: background `#0D0D0D`, violet accent `#7C3AED`, white text, Inter font, smooth transitions throughout

**User-visible outcome:** Users experience a clean, mobile-style single-screen chat interface with a slide-in history drawer, floating mascot on the welcome screen, full-width input bar, and full-screen overlays for app/game previews.
