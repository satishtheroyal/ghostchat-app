# GhostChat API Reference

## REST Endpoints

### Create Session
**POST** `/api/sessions`

Create a new chat session.

**Request Body**:
```json
{
  "ttl": 600
}
```

**Response**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "inviteToken": "550e8400-e29b-41d4-a716-446655440001",
  "inviteLink": "https://ghostchat.app/join/550e8400-e29b-41d4-a716-446655440000?token=550e8400-e29b-41d4-a716-446655440001",
  "expiresIn": 600
}
```

**Parameters**:
- `ttl` (optional): Session time-to-live in seconds (default: 600)

**Status Codes**:
- `200 OK`: Session created successfully
- `400 Bad Request`: Invalid request
- `500 Internal Server Error`: Server error

---

### Health Check
**GET** `/health`

Check server health.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-06-01T12:00:00Z"
}
```

---

## WebSocket Events

### Connection
**Event**: `connect`

Emitted when client connects to WebSocket.

---

### Join Session
**Event**: `join-session`

Join a chat session.

**Payload**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-uuid-or-anonymous"
}
```

---

### Send Message
**Event**: `send-message`

Send encrypted message.

**Payload**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "encryptedMessage": {
    "ciphertext": "base64-encoded-ciphertext",
    "iv": "base64-encoded-iv",
    "tag": "base64-encoded-auth-tag",
    "version": 1
  },
  "timestamp": "2024-06-01T12:00:00Z"
}
```

---

### Receive Message
**Event**: `receive-message`

Receive encrypted message from other user.

**Payload**:
```json
{
  "encryptedMessage": {
    "ciphertext": "base64-encoded-ciphertext",
    "iv": "base64-encoded-iv",
    "tag": "base64-encoded-auth-tag",
    "version": 1
  },
  "timestamp": "2024-06-01T12:00:00Z",
  "fromUser": "user-socket-id"
}
```

---

### Disconnect
**Event**: `disconnect`

Emitted when client disconnects.

---

## Error Responses

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "timestamp": "2024-06-01T12:00:00Z"
}
```

**Error Codes**:
- `INVALID_SESSION`: Session not found
- `INVALID_PIN`: PIN authentication failed
- `ENCRYPTION_ERROR`: Encryption/decryption error
- `RATE_LIMITED`: Too many requests
- `SERVER_ERROR`: Internal server error

---

## Rate Limiting

- Session creation: 10 per minute per IP
- Message send: 100 per minute per session
- WebSocket connections: 100 per minute per IP

---

## CORS

Allowed origins:
- Production: `https://ghostchat.app`
- Development: `http://localhost:5173`

---

## Content Security Policy

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
connect-src 'self' wss:;
img-src 'self' data:;
```
