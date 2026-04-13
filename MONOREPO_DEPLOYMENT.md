# Vertex Ridge - Monorepo Deployment Guide

Your project structure (backend + frontend in same repo) is perfect for these deployment options.

---

## 🎯 Option 1: Railway (RECOMMENDED - Easiest)

Railway automatically detects and deploys monorepos. **This is the simplest option!**

### Step-by-Step:

1. **Push to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Ready for deployment"
   git branch -M main
   git remote add origin YOUR_GITHUB_URL
   git push -u origin main
   ```

2. **Go to Railway.app**:
   - Visit [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Railway will create TWO services automatically**:
   - **Frontend Service** (detects Vite)
   - **Backend Service** (detects Node.js in /server)

4. **Configure Backend Service**:
   - Click on the backend service
   - Go to "Settings" → "Start Command"
   - Set: `cd server && npm start`
   - Go to "Variables" and add:
     ```
     NODE_ENV=production
     PORT=5000
     SUPABASE_URL=your_supabase_url
     SUPABASE_SERVICE_KEY=your_service_key
     JWT_SECRET=your_jwt_secret
     CORS_ORIGIN=${{RAILWAY_STATIC_URL}}
     ```

5. **Configure Frontend Service**:
   - Click on the frontend service
   - Go to "Variables" and add:
     ```
     VITE_API_URL=${{backend.RAILWAY_PUBLIC_DOMAIN}}/api
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_anon_key
     ```

6. **Generate Domains**:
   - Click each service → "Settings" → "Generate Domain"
   - Railway will give you URLs like:
     - Frontend: `vertex-ridge.up.railway.app`
     - Backend: `vertex-ridge-api.up.railway.app`

7. **Update CORS**:
   - Go back to backend variables
   - Update `CORS_ORIGIN` with your frontend URL

**Done!** 🎉 Your app is live!

**Cost**: $5/month (includes $5 free credit)

---

## 🎯 Option 2: Render (Two Services)

Render can deploy both from the same repo using different paths.

### Step-by-Step:

1. **Create render.yaml** in project root:
   ```yaml
   services:
     # Backend Service
     - type: web
       name: vertex-ridge-api
       env: node
       region: oregon
       buildCommand: cd server && npm install
       startCommand: cd server && npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: PORT
           value: 5000
         - key: SUPABASE_URL
           sync: false
         - key: SUPABASE_SERVICE_KEY
           sync: false
         - key: JWT_SECRET
           generateValue: true
         - key: CORS_ORIGIN
           value: https://vertex-ridge.onrender.com
       
     # Frontend Service
     - type: web
       name: vertex-ridge-web
       env: static
       region: oregon
       buildCommand: npm install && npm run build
       staticPublishPath: ./dist
       envVars:
         - key: VITE_API_URL
           value: https://vertex-ridge-api.onrender.com/api
         - key: VITE_SUPABASE_URL
           sync: false
         - key: VITE_SUPABASE_ANON_KEY
           sync: false
   ```

2. **Deploy to Render**:
   - Go to [render.com](https://render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repo
   - Render will detect `render.yaml`
   - Add your environment variables
   - Click "Apply"

**Cost**: Free tier available (with limitations)

---

## 🎯 Option 3: Vercel (Monorepo with API Routes)

Deploy everything to Vercel using serverless functions for the backend.

### Step-by-Step:

1. **Create vercel.json** in project root:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist"
         }
       },
       {
         "src": "server/index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "server/index.js"
       },
       {
         "src": "/(.*)",
         "dest": "/dist/$1"
       }
     ]
   }
   ```

2. **Update server/index.js** for Vercel:
   ```javascript
   // Add at the end of server/index.js
   module.exports = app; // Export for Vercel
   ```

3. **Deploy**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repo
   - Add environment variables
   - Deploy

**Cost**: Free tier available

---

## 🎯 Option 4: Single VPS (All-in-One)

Deploy both frontend and backend on one server.

### Step-by-Step:

1. **SSH into your VPS**:
   ```bash
   ssh root@your-server-ip
   ```

2. **Install dependencies**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   apt-get install -y nodejs nginx
   npm install -g pm2
   ```

3. **Clone and setup**:
   ```bash
   cd /var/www
   git clone YOUR_REPO_URL vertex-ridge
   cd vertex-ridge
   
   # Install and build frontend
   npm install
   npm run build
   
   # Setup backend
   cd server
   npm install
   cp .env.example .env
   nano .env  # Add your variables
   ```

4. **Start backend with PM2**:
   ```bash
   pm2 start index.js --name vertex-ridge-api
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx** (`/etc/nginx/sites-available/vertex-ridge`):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # Serve frontend static files
       location / {
           root /var/www/vertex-ridge/dist;
           try_files $uri $uri/ /index.html;
       }

       # Proxy API requests to backend
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

6. **Enable and start**:
   ```bash
   ln -s /etc/nginx/sites-available/vertex-ridge /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

7. **Setup SSL**:
   ```bash
   apt-get install certbot python3-certbot-nginx
   certbot --nginx -d your-domain.com
   ```

**Cost**: $5-10/month (VPS)

---

## 🎯 Option 5: Docker (Any Platform)

Containerize both services and deploy anywhere.

### Create Dockerfile in project root:

```dockerfile
# Multi-stage build
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS backend
WORKDIR /app
COPY server/package*.json ./
RUN npm install --production
COPY server/ ./
COPY --from=frontend-build /app/dist ./public

EXPOSE 5000
CMD ["node", "index.js"]
```

### Update server/index.js to serve frontend:

```javascript
// Add before routes
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// Add after all API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
```

### Create docker-compose.yml:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
      - JWT_SECRET=${JWT_SECRET}
    restart: unless-stopped
```

### Deploy:

```bash
docker-compose up -d
```

---

## 📊 Comparison Table

| Platform | Difficulty | Cost | Best For |
|----------|-----------|------|----------|
| **Railway** | ⭐ Easy | $5/mo | Quick deployment, monorepos |
| **Render** | ⭐⭐ Medium | Free/Paid | Budget-friendly |
| **Vercel** | ⭐⭐ Medium | Free/Paid | Serverless, edge functions |
| **VPS** | ⭐⭐⭐ Hard | $5-10/mo | Full control, custom setup |
| **Docker** | ⭐⭐⭐ Hard | Varies | Portability, any platform |

---

## 🎯 My Recommendation

**For your monorepo setup, use Railway!**

Why?
- ✅ Detects monorepos automatically
- ✅ Deploys both services with one click
- ✅ Automatic HTTPS
- ✅ Easy environment variables
- ✅ GitHub integration
- ✅ Free $5 credit monthly
- ✅ Simple rollbacks
- ✅ Built-in monitoring

**Time to deploy: 10 minutes** ⚡

---

## 🚀 Quick Start with Railway

1. Push code to GitHub
2. Go to railway.app
3. Click "Deploy from GitHub"
4. Add environment variables
5. Done! 🎉

Your app will be live at:
- `https://vertex-ridge.up.railway.app`

---

## 📝 Environment Variables Needed

**Backend**:
```
NODE_ENV=production
PORT=5000
SUPABASE_URL=your_url
SUPABASE_SERVICE_KEY=your_key
JWT_SECRET=your_secret
CORS_ORIGIN=https://your-frontend-url
```

**Frontend**:
```
VITE_API_URL=https://your-backend-url/api
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

---

## 🐛 Common Issues

### Issue: CORS errors after deployment
**Fix**: Update `CORS_ORIGIN` in backend to match your frontend URL

### Issue: API not found (404)
**Fix**: Ensure backend is running and `VITE_API_URL` is correct

### Issue: Build fails
**Fix**: Check Node.js version (use 18 or 20)

---

**Ready to deploy? Start with Railway for the easiest experience!**
