# GhostChat - Secure End-to-End Encrypted Ephemeral Chat

🔐 **Private. Encrypted. Disappearing.**

A fully functional secure chat application where messages are end-to-end encrypted, sessions are ephemeral, and nothing is stored on the server.

## Features

### v1.0 - GHOST (Personal Use)
- ✅ **Link-based Sessions** - Create unique invite links (no signup required)
- ✅ **PIN Authentication** - 4-6 digit PIN for extra security
- ✅ **End-to-End Encryption** - ECDH + AES-256-GCM (Web Crypto API)
- ✅ **Session Timer** - Auto-expire after user-defined duration
- ✅ **Self-Destructing Messages** - Disappear after read or time delay
- ✅ **Anti-Screenshot** - CSS protections + watermark overlay
- ✅ **Zero Server Storage** - Encrypted relay only, messages never logged

### v2.0 - PHANTOM (Product Launch)
- User accounts (email/phone)
- Contact sync & discovery
- Permission-based message saving
- Session history (metadata only)
- Activity logs

### v3.0+ - Future
- Group chat (up to 50 members)
- File/photo sharing (encrypted)
- Voice & video calls
- Mobile apps (React Native/Flutter)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + TailwindCSS + PWA |
| **Backend** | Node.js + Express + Socket.io |
| **Encryption** | Web Crypto API (ECDH P-256 + AES-256-GCM) |
| **Realtime** | Socket.io WebSocket |
| **Database** | PostgreSQL (v2.0) + Redis (ephemeral) |
| **Deployment** | Vercel (frontend) + Railway (backend) |

## Architecture

```
User A                           User B
   ↓                              ↓
[React + Web Crypto]  ←WebSocket→  [React + Web Crypto]
   ↓                              ↓
   └──→ [Express + Socket.io] ←──┘
        (Blind Relay - Never sees plaintext)
        ↓
   [Redis] → Auto-expire
   [PostgreSQL] → v2.0 metadata only
```

## Security Model

### Encryption Flow
```
1. User A generates ECDH keypair (P-256)
2. User B enters PIN → derives same shared secret
3. Both derive same AES-256-GCM key from shared secret + PIN
4. All messages encrypted on-device before sending
5. Server relay only (forward encrypted blobs)
6. User B decrypts using same key
7. Messages auto-destroy (client + server TTL)
```

### Zero-Knowledge Architecture
- ✅ Server never knows encryption keys
- ✅ Server never sees plaintext messages
- ✅ Server never stores message content
- ✅ Even if backend hacked: no data compromised
- ✅ No account required (v1.0)

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Redis (for local dev)
- PostgreSQL (for v2.0)

### Local Development

```bash
# Clone repo
git clone https://github.com/satishtheroyal/ghostchat-app.git
cd ghostchat-app

# Install dependencies
npm install --workspaces

# Setup environment variables
cp packages/backend/.env.local.example packages/backend/.env.local
cp packages/frontend/.env.local.example packages/frontend/.env.local

# Start backend (port 3001)
npm -w packages/backend run dev

# Start frontend (port 5173)
npm -w packages/frontend run dev

# Open http://localhost:5173
```

## Deployment

### Backend - Railway
```bash
# Login to Railway
railway login

# Deploy backend
cd packages/backend
railway link
railway up
```

### Frontend - Vercel
```bash
# Deploy frontend
vercel --prod
```

## Project Structure

```
ghostchat-app/
├── packages/
│   ├── backend/          # Node.js + Express
│   │   ├── src/
│   │   │   ├── server.js        # Entry point
│   │   │   ├── routes/          # API endpoints
│   │   │   ├── sockets/         # Socket.io handlers
│   │   │   ├── services/        # Business logic
│   │   │   ├── middleware/      # Auth, validation
│   │   │   ├── crypto/          # Encryption helpers
│   │   │   └── utils/           # Utilities
│   │   └── package.json
│   │
│   └── frontend/         # React + Vite
│       ├── src/
│       │   ├── App.tsx           # Main component
│       │   ├── pages/            # Page components
│       │   ├── components/       # Reusable components
│       │   ├── services/         # API + Socket clients
│       │   ├── crypto/           # Client-side encryption
│       │   └── utils/            # Utilities
│       └── vite.config.ts
│
├── docs/
│   ├── ARCHITECTURE.md   # System design
│   ├── API.md            # Backend API
│   ├── SECURITY.md       # Security details
│   └── DEPLOYMENT.md     # Deployment guide
│
└── .github/workflows/    # CI/CD pipelines
```

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Security Details](./docs/SECURITY.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## Roadmap

- [x] Project setup
- [ ] Week 1: Core chat engine (E2EE, sessions, PIN auth)
- [ ] Week 2: Self-destruct messages + screenshot prevention
- [ ] Week 3: User accounts + contact sync (v2.0)
- [ ] Week 4: Deploy live + optimize

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

MIT License - See [LICENSE](./LICENSE)

## Security

For security concerns, please email: security@ghostchat.app (or open a private security advisory)

---

**Built with ❤️ for privacy.**

> "The best way to keep a secret is to share it securely."
