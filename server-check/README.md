# Live Checkbox Grid

A real-time checkbox grid with Redis-backed state, WebSocket broadcasting, custom rate limiting, and OIDC login.

## Overview

This project demonstrates a scalable real-time checkbox system using:

- Node.js
- Express
- Socket.IO
- Redis / Valkey
- OpenID Connect (OIDC) authentication
- Custom rate limiting for HTTP and WebSocket events

## Features

- 10,000 checkbox grid rendered in the browser
- Real-time updates across connected users
- OIDC login flow using an external identity provider
- Anonymous users have read-only visibility
- Logged-in users can toggle checkboxes
- Only the user who checked a box can uncheck it
- Redis Pub/Sub broadcast for multi-instance coordination
- Custom rate limiting without external rate-limit packages

## Tech Stack

- Backend: Node.js, Express, Socket.IO
- Redis: Valkey-compatible store via `@valkey/client`
- Frontend: HTML/CSS/JavaScript
- Authentication: OIDC / OAuth 2.0

## Getting Started

### Requirements

- Node.js 18+
- Redis or Valkey-compatible server
- OIDC provider with the following endpoints:
  - `/api/oauth/authorize`
  - `/api/oauth/token`
  - `/api/oauth/userinfo`

### Setup

1. Copy `.env.example` to `.env`
2. Fill in the environment variables, especially `OIDC_CLIENT_ID` and `OIDC_ISSUER`
3. Start Valkey or Redis

```bash
docker run -p 6379:6379 -it valkey/valkey:unstable
```

4. Install dependencies

```bash
npm install
```

5. Start the server

```bash
npm start
```

6. Open the app in your browser:

```text
http://localhost:4000
```

## Environment Variables

Use `.env.example` as a template.

- `PORT` - application port
- `VALKEY_URL` - Redis/Valkey connection URL
- `OIDC_ISSUER` - OIDC provider base URL
- `OIDC_CLIENT_ID` - client ID registered with the OIDC provider
- `OIDC_REDIRECT_URI` - redirect URI for the OIDC flow
- `APP_BASE_URL` - application origin
- `SESSION_TTL` - session lifetime in seconds
- `API_RATE_LIMIT` - HTTP requests allowed per window
- `API_RATE_WINDOW` - HTTP rate limit window in seconds
- `SOCKET_RATE_LIMIT` - socket actions allowed per window
- `SOCKET_RATE_WINDOW` - socket rate limit window in seconds
- `CHECKBOX_GRID_SIZE` - number of checkboxes rendered

## How It Works

### Auth Flow

1. User clicks login
2. The browser generates a PKCE code verifier and challenge
3. User is redirected to the OIDC authorization endpoint
4. OIDC redirects back with a code
5. The app exchanges the code for an access token
6. The app calls `/api/oauth/userinfo`
7. A session is stored in Redis and the user receives a cookie

### WebSocket Flow

- Clients connect with `socket.io` and send the session cookie
- The server sends the current checked state
- When a user toggles a box, the server validates ownership and rate limits the action
- The server updates Redis state and publishes the change to Redis Pub/Sub
- All connected instances receive the update and broadcast it locally

### Rate Limiting

- HTTP API routes are rate-limited by IP and route
- WebSocket checkbox actions are rate-limited per user/socket
- Implementation uses Redis counters and expiry windows

## Notes

- Anonymous users can view the grid but cannot change it
- The backend stores checkbox state in Redis hashes for compact state management
- Redis Pub/Sub allows horizontal scaling across multiple server instances

## Demo Video

> Add your unlisted YouTube demo link here.
