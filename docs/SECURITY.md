# GhostChat Security Specification

## Cryptography

### Key Exchange: ECDH (Elliptic Curve Diffie-Hellman)
- **Curve**: P-256 (secp256r1)
- **Implementation**: Web Crypto API (`SubtleCrypto.generateKey`)
- **Key Size**: 256 bits
- **Use**: Derive shared secret between two users

### Encryption: AES-256-GCM
- **Algorithm**: AES (Advanced Encryption Standard)
- **Key Size**: 256 bits
- **Mode**: GCM (Galois/Counter Mode)
- **IV Size**: 96 bits (12 bytes)
- **Tag Size**: 128 bits (16 bytes)
- **Use**: Encrypt messages
- **Implementation**: Web Crypto API (`SubtleCrypto.encrypt`)

### Key Derivation
```
Shared Secret (from ECDH)
  + PIN Code (4-6 digits, never sent to server)
  = AES-256-GCM Key (via HKDF in future)
```

## Authentication

### PIN Authentication
- **Length**: 4-6 digits
- **Format**: User-defined
- **Transmission**: Out-of-band (WhatsApp, Telegram, etc.)
- **Server Knowledge**: Zero (never sent to server)
- **Purpose**: Derive encryption keys

### Session Tokens
- **Invite Token**: UUID, shared in link
- **Purpose**: Prevent link forgery
- **TTL**: Same as session
- **Format**: UUID v4

## Ephemeral Design

### Session Lifetime
- **Default TTL**: 10 minutes
- **User-Configurable**: 5 min to 1 hour
- **Storage**: Redis with automatic expiration
- **After Expiry**: Session data deleted, WebSocket closed

### Message Lifetime
- **Options**:
  - "Never": Message persists (user must manually delete)
  - "On Read": Delete after user opens
  - "1 min": Delete 1 minute after sent
  - "5 min": Delete 5 minutes after sent
  - "Custom": User-defined timer

- **Implementation**:
  - **Client-side**: JavaScript timeout + DOM deletion
  - **Server-side**: Redis TTL auto-delete
  - **Both**: Belt-and-suspenders approach

## Zero-Knowledge Architecture

### What Server Never Sees
- ✅ Encryption keys (ECDH or AES)
- ✅ PIN codes
- ✅ Message plaintext
- ✅ User identities (v1.0)
- ✅ Metadata about conversation

### What Server Only Sees
- Encrypted message blobs (random bytes)
- Session ID (UUID)
- Timestamps
- Message size (cannot be hidden)

### Server Compromise Impact
- Even if backend hacked and database stolen:
  - No encryption keys → messages unreadable
  - No PINs → cannot join sessions
  - No plaintext → no conversations recovered
  - No user data (v1.0) → cannot identify users

## Anti-Screenshot Prevention

### Web Protections
- **CSS**: `user-select: none` (prevent text selection)
- **Canvas**: Detect canvas fingerprinting attempts
- **Right-click**: Disable context menu
- **Print**: Disable printing
- **Drag**: Prevent drag-out

### Limitations
- Web APIs cannot prevent OS-level screenshots
- PWA can detect some screenshots (browser-specific)

### Mobile App Protections (v2.0+)
- **Android**: `FLAG_SECURE` window flag
- **iOS**: Screenshot detection via `UIApplicationUserDidTakeScreenshot`
- **Watermark**: Invisible watermark on content (future)
- **Blur on app switch**: Sensitive info blur (like banking apps)

## Threat Model

### Protected Against
✅ **Server Compromise**: No keys or plaintext stored
✅ **Network Sniffing**: All traffic encrypted (HTTPS + E2EE)
✅ **Man-in-the-Middle**: ECDH prevents MITM
✅ **Unauthorized Access**: PIN required
✅ **Message Interception**: AES-256-GCM authenticated encryption
✅ **Screenshot/Recording**: PWA + app protections
✅ **Message Persistence**: Auto-expiry + client deletion

### Not Protected Against
⚠️ **Malware on Device**: If user's device compromised, can read plaintext
⚠️ **User's Own Actions**: User can manually copy text
⚠️ **Shoulder Surfing**: Someone looking over shoulder
⚠️ **Keylogger**: Installed on device
⚠️ **Physical Access**: Attacker with device access
⚠️ **OS Screenshot**: Some OS-level screenshot tools bypass protections

### Security Assumptions
- User devices are not compromised
- Users trust each other with PIN
- Internet connection is HTTPS-protected
- Devices have secure storage

## Compliance & Standards

### Crypto Standards
- ✅ NIST P-256 curve (FIPS 186-4 approved)
- ✅ AES-256 (FIPS 197)
- ✅ GCM authenticated encryption (SP 800-38D)

### Web Standards
- ✅ Web Crypto API (W3C standard)
- ✅ HTTPS/TLS 1.3 (in production)
- ✅ Content Security Policy (CSP)

### Privacy
- ✅ GDPR compliant (no personal data stored v1.0)
- ✅ No tracking or analytics (optional)
- ✅ No third-party cookies
- ✅ Right to deletion (automatic)

## Implementation Security Checklist

- [ ] Use Web Crypto API (no external crypto libs)
- [ ] Validate all inputs (IV, public keys, etc.)
- [ ] Use unique IV per message (never reuse)
- [ ] Implement GCM tag verification
- [ ] Clear sensitive data from memory
- [ ] Use HTTPS/TLS in production
- [ ] Implement CORS correctly
- [ ] Rate limit API endpoints
- [ ] Validate WebSocket connections
- [ ] Implement proper error handling
- [ ] Log security events (no message content)
- [ ] Regular security audits
- [ ] Dependency scanning (npm audit)

## Future Improvements

- [ ] Add perfect forward secrecy (PFS) with ephemeral keys
- [ ] Implement Noise Protocol for stricter guarantees
- [ ] Add out-of-band key verification (QR codes)
- [ ] Implement disappearing media (photos, videos)
- [ ] Add encrypted file sharing
- [ ] Implement group chat encryption
- [ ] Add call encryption (SRTP)
