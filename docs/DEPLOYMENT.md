# GhostChat Deployment Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- GitHub account
- Railway.app account (for backend)
- Vercel account (for frontend)
- Git CLI

## Local Development

### 1. Clone Repository

```bash
git clone https://github.com/satishtheroyal/ghostchat-app.git
cd ghostchat-app
```

### 2. Install Dependencies

```bash
npm install --workspaces
```

This installs dependencies for both `packages/backend` and `packages/frontend`.

### 3. Environment Setup

**Backend** (`packages/backend/.env.local`):
```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-key-change-in-production
SESSION_TTL=600
```

**Frontend** (`packages/frontend/.env.local`):
```env
VITE_API_URL=http://localhost:3001
```

### 4. Start Redis (macOS/Linux)

```bash
# Using Homebrew
brew services start redis

# Or with Docker
docker run -d -p 6379:6379 redis:7
```

**Windows**:
```bash
# Using WSL2 or Docker Desktop
docker run -d -p 6379:6379 redis:7
```

### 5. Run Backend

```bash
npm -w packages/backend run dev
```

Server should be running at `http://localhost:3001`

### 6. Run Frontend (new terminal)

```bash
npm -w packages/frontend run dev
```

UI should be available at `http://localhost:5173`

### 7. Test

Open browser:
1. Go to `http://localhost:5173`
2. Create a new chat session
3. Share the link
4. Join in another browser tab/window
5. Start chatting!

---

## Production Deployment

### Option 1: Railway + Vercel (Recommended)

#### Backend Deployment (Railway)

**1. Create Railway Account**
- Sign up at [railway.app](https://railway.app)

**2. Create New Project**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
cd packages/backend
railway init
```

**3. Add Redis Add-on**
- In Railway dashboard: Project → Add Service → Redis
- Railway auto-injects `REDIS_URL`

**4. Set Environment Variables**
```bash
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set FRONTEND_URL=https://your-frontend-domain.vercel.app
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set SESSION_TTL=600
```

**5. Deploy**
```bash
railway link
railway up
```

Backend will be live at: `https://ghostchat-backend-{random}.railway.app`

---

#### Frontend Deployment (Vercel)

**1. Create Vercel Account**
- Sign up at [vercel.com](https://vercel.com)

**2. Connect GitHub**
```bash
# Make sure your repo is pushed to GitHub
git push origin main
```

**3. Import Project**
- Go to Vercel dashboard
- "Add New" → "Project" → Select `ghostchat-app` repo
- Root Directory: `packages/frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

**4. Set Environment Variables**
```
VITE_API_URL=https://ghostchat-backend-{random}.railway.app
```

**5. Deploy**
- Click "Deploy"
- Wait for build to complete
- Frontend will be live at: `https://ghostchat-{random}.vercel.app`

---

### Option 2: Docker (for both)

#### Create Dockerfile (Backend)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY packages/backend/package*.json ./

RUN npm ci --only=production

COPY packages/backend/src ./src

EXPOSE 3001

CMD ["node", "src/server.js"]
```

#### Build & Run
```bash
docker build -t ghostchat-backend .
docker run -p 3001:3001 -e REDIS_URL=redis://host.docker.internal:6379 ghostchat-backend
```

---

### Option 3: Manual VPS (DigitalOcean, AWS, etc.)

**1. SSH into server**
```bash
ssh root@your-server-ip
```

**2. Install Node & Redis**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs redis-server
```

**3. Clone repo**
```bash
git clone https://github.com/satishtheroyal/ghostchat-app.git
cd ghostchat-app
npm install --workspaces
```

**4. Setup environment**
```bash
cp packages/backend/.env.local.example packages/backend/.env.local
# Edit .env.local with production values
```

**5. Start with PM2**
```bash
npm install -g pm2
pm2 start packages/backend/src/server.js --name ghostchat-backend
pm2 save
pm2 startup
```

**6. Setup Nginx reverse proxy**
```bash
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/ghostchat
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/ghostchat /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

**7. Get SSL (Let's Encrypt)**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## CI/CD Pipeline

GitHub Actions workflows automatically:

1. **On PR to `main`**:
   - Run backend tests
   - Build frontend
   - Check for secrets

2. **On merge to `main`**:
   - Deploy backend to Railway
   - Deploy frontend to Vercel
   - Run integration tests

---

## Monitoring

### Railway Dashboard
- Real-time logs
- Memory/CPU usage
- Error tracking
- Auto-scaling settings

### Vercel Analytics
- Build metrics
- Performance monitoring
- Deployment history
- Error logs

### Health Checks
```bash
# Check backend
curl https://your-backend.railway.app/health

# Should return:
# {"status": "ok", "timestamp": "2024-06-01T12:00:00Z"}
```

---

## Scaling

### Vertical Scaling (Railway)
- Upgrade instance size
- Increase RAM
- Upgrade to "Premium" tier

### Horizontal Scaling
- Add load balancer
- Multiple backend instances
- Redis cluster

---

## Cost Estimation

| Service | Tier | Cost/Month |
|---------|------|------------|
| Railway (Backend) | Starter | Free |
| Railway (Redis) | Starter | Free |
| Vercel (Frontend) | Hobby | Free |
| **Total** | | **Free** |

*Pricing as of 2024. Check provider websites for current rates.*

---

## Troubleshooting

### Backend won't start
```bash
# Check Redis
redis-cli ping
# Should return: PONG

# Check logs
npm -w packages/backend run dev
```

### Frontend can't connect
```bash
# Check VITE_API_URL
echo $VITE_API_URL

# Test API
curl $VITE_API_URL/health
```

### WebSocket connection failed
- Check CORS settings in backend
- Verify frontend URL in `FRONTEND_URL` env var
- Check SSL/TLS (must use `wss://` in production)

---

## Security Checklist

- [ ] Change `JWT_SECRET` to strong random value
- [ ] Set `NODE_ENV=production` in Railway
- [ ] Use HTTPS only (redirect HTTP → HTTPS)
- [ ] Enable authentication (v2.0)
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Enable security headers
- [ ] Regular dependency updates
- [ ] Monitor for CVEs

---

## Support

- GitHub Issues: Report bugs
- Email: security@ghostchat.app (security issues)
- Discussions: Ask questions
