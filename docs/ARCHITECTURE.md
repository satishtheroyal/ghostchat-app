# GhostChat Architecture

## System Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Vercel)                 │
│         React + Vite + Socket.io Client              │
│        (Encryption: Web Crypto API)                  │
│                                                      │
│  [User A UI] ←→ [Socket.io] ←→ [User B UI]         │
│   Generates ECDH key, encrypts messages locally     │
└─────────────────────────────────────────────────────┘
                    WebSocket
                    (encrypted)
                        ↓
┌─────────────────────────────────────────────────────┐
│              Backend (Railway)                       │
│    Node.js + Express + Socket.io Server              │
│  (Blind Relay - Never sees plaintext)                │
│                                                      │
│  [Session Manager] → [Socket.io Relay] →            │
│  Forward encrypted messages between users            │
└─────────────────────────────────────────────────────┘
                        ↓
        ┌──────────────┬──────────────┐
        ↓              ↓              ↓
   [Redis]      [PostgreSQL]   [Logs]
  Ephemeral     User Data       (v2.0)
  Sessions      (v2.0)
```

## Data Flow

### Session Creation
```
User A clicks "Create Chat"
  ↓
[Frontend] generates unique session_id (UUID)
  ↓
POST /api/sessions → Backend
  ↓
[Backend] stores in Redis with TTL
  ↓
Return: {sessionId, inviteToken, inviteLink}
  ↓
User A shares link
```

### Message Encryption Flow
```
User A types message
  ↓
[Frontend] Generate ECDH keypair (P-256)
  ↓
Export public key, send to User B
  ↓
User B enters PIN (4-6 digits)
  ↓
Both derive SAME shared secret from:
  - ECDH shared secret
  - PIN code (never sent to server)
  ↓
Generate AES-256-GCM key from shared secret
  ↓
User A encrypts message: plaintext → ciphertext
  ↓
Send encrypted blob to server
  ↓
[Server] (blind relay) forward to User B
  ↓
User B decrypts: ciphertext → plaintext
  ↓
Display in UI
```

### Session Auto-Expiry
```
Session TTL set (default 10 min)
  ↓
Redis stores: SET session:UUID EXP 600
  ↓
After 600s → Redis auto-deletes key
  ↓
[Backend] detects no session data
  ↓
WebSocket closes connection
  ↓
UI shows "Session expired"
```

## Component Overview

### Backend Components

#### Server (`src/server.js`)
- Express.js HTTP server
- Socket.io WebSocket handler
- Health check endpoint
- Session creation API

#### Socket Handlers (`src/sockets/`)
- `connection`: User joins
- `join-session`: Join specific session room
- `send-message`: Relay encrypted message
- `disconnect`: Clean up user

#### Services (`src/services/`)
- Session management
- Message relay
- TTL handling

#### Middleware (`src/middleware/`)
- CORS validation
- Rate limiting
- Input validation

#### Crypto (`src/crypto/`)
- ECDH validation
- AES encryption validation
- Key validation

### Frontend Components

#### Pages
- `CreateSession`: Generate new chat session
- `JoinSession`: Enter PIN and join
- `ChatRoom`: Main chat interface

#### Crypto (`src/crypto/`)
- `ecdh.js`: ECDH key exchange
- `aes.js`: AES-256-GCM encryption/decryption

#### Services (`src/services/`)
- Socket.io client
- API client
- Session manager

## Security Considerations

### Zero-Knowledge Server
- Server never knows encryption keys
- Server never sees plaintext
- Server never stores messages
- Server only relays encrypted blobs
- Even if hacked: no user data compromised

### End-to-End Encryption
- ECDH P-256 for key exchange
- AES-256-GCM for message encryption
- Unique IV per message (never reused)
- Authenticated encryption (GCM tag)

### Ephemeral by Design
- Sessions auto-expire (user-defined TTL)
- Messages auto-delete (client + server)
- No persistent logs
- Redis auto-purge on TTL

### PIN-Based Authentication
- 4-6 digit PIN shared out-of-band
- Used to derive shared secret
- Never sent to server
- Prevents unauthorized access

## Threat Model

### Protected Against
- ✅ Server compromise (messages safe)
- ✅ Network sniffing (encrypted WebSocket)
- ✅ Man-in-the-middle (E2EE)
- ✅ Screenshot/screen recording (PWA protections)
- ✅ Unauthorized access (PIN required)

### Assumptions
- User devices are trusted
- PIN shared securely (out-of-band)
- Internet connection is SSL/TLS protected

## Scalability

### Current (v1.0)
- Single Express server
- Redis for session storage
- Socket.io for WebSocket relay
- ~1000 concurrent connections

### Future (v2.0+)
- Load balancer
- Multiple Socket.io servers
- Redis cluster
- PostgreSQL for user data
- CDN for static assets

## Deployment Architecture

### Frontend
- Vercel (serverless)
- Build: `npm run build`
- Output: Static files in `dist/`
- Deployment: Automatic on `main` push

### Backend
- Railway (containerized)
- Build: Node.js 18+
- Runtime: `npm start`
- Environment: Auto-injected from Railway

### Databases
- Redis: Railway add-on
- PostgreSQL: Railway add-on (v2.0)

## Performance Targets

- Session creation: < 500ms
- Message delivery: < 200ms
- Encryption/decryption: < 100ms
- TTL cleanup: < 1s
- Uptime: > 99.5%

## Monitoring & Logging

- Console logs (development)
- Sentry (error tracking, future)
- Google Analytics (optional, future)
- No message content logging
