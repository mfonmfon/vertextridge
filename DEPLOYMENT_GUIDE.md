# Vertex Ridge - Deployment Guide

This guide covers deploying your full-stack trading platform (React frontend + Node.js backend + Supabase database).

## 🏗️ Architecture Overview

- **Frontend**: React + Vite (Static files)
- **Backend**: Node.js + Express API
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Supabase Storage (for avatars)

---

## 🚀 Recommended Deployment Options

### Option 1: Vercel (Frontend) + Render (Backend) - EASIEST

#### **Frontend on Vercel**

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `./` (leave as root)
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Add Environment Variables:
     ```
     VITE_API_URL=https://your-backend.onrender.com/api
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
   - Click "Deploy"

#### **Backend on Render**

1. **Create render.yaml** (in project root):
   ```yaml
   services:
     - type: web
       name: vertex-ridge-api
       env: node
       region: oregon
       plan: free
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
           value: https://your-vercel-app.vercel.app
   ```

2. **Deploy to Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: vertex-ridge-api
     - **Environment**: Node
     - **Build Command**: `cd server && npm install`
     - **Start Command**: `cd server && npm start`
   - Add Environment Variables (from your `.env`)
   - Click "Create Web Service"

3. **Update Frontend with Backend URL**
   - Go back to Vercel
   - Update `VITE_API_URL` to your Render URL
   - Redeploy

---

### Option 2: Railway (Full Stack) - SIMPLE

Railway can host both frontend and backend together.

1. **Create railway.json**:
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm run start:prod",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

2. **Add production scripts to package.json**:
   ```json
   {
     "scripts": {
       "build:frontend": "npm run build",
       "build:backend": "cd server && npm install",
       "build": "npm run build:frontend && npm run build:backend",
       "start:prod": "cd server && npm start"
     }
   }
   ```

3. **Deploy**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Add environment variables
   - Railway will auto-deploy

---

### Option 3: DigitalOcean App Platform - PROFESSIONAL

1. **Create .do/app.yaml**:
   ```yaml
   name: vertex-ridge
   services:
     - name: api
       github:
         repo: your-username/your-repo
         branch: main
         deploy_on_push: true
       source_dir: /server
       run_command: npm start
       environment_slug: node-js
       envs:
         - key: NODE_ENV
           value: production
         - key: SUPABASE_URL
           value: ${SUPABASE_URL}
         - key: SUPABASE_SERVICE_KEY
           value: ${SUPABASE_SERVICE_KEY}
       http_port: 5000
       
     - name: web
       github:
         repo: your-username/your-repo
         branch: main
         deploy_on_push: true
       build_command: npm run build
       run_command: npx serve -s dist -l 3000
       environment_slug: node-js
       envs:
         - key: VITE_API_URL
           value: ${api.PUBLIC_URL}/api
       http_port: 3000
   ```

2. **Deploy**:
   - Go to [DigitalOcean](https://cloud.digitalocean.com/apps)
   - Click "Create App"
   - Connect GitHub
   - DigitalOcean will detect the config
   - Add environment variables
   - Deploy

---

### Option 4: Self-Hosted VPS (Ubuntu) - FULL CONTROL

#### **Setup VPS (DigitalOcean, Linode, AWS EC2)**

1. **SSH into your server**:
   ```bash
   ssh root@your-server-ip
   ```

2. **Install Node.js & PM2**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   apt-get install -y nodejs
   npm install -g pm2
   ```

3. **Install Nginx**:
   ```bash
   apt-get install nginx
   ```

4. **Clone your repository**:
   ```bash
   cd /var/www
   git clone YOUR_REPO_URL vertex-ridge
   cd vertex-ridge
   ```

5. **Setup Backend**:
   ```bash
   cd server
   npm install
   cp .env.example .env
   nano .env  # Add your environment variables
   ```

6. **Setup Frontend**:
   ```bash
   cd ..
   npm install
   npm run build
   ```

7. **Start Backend with PM2**:
   ```bash
   cd server
   pm2 start index.js --name vertex-ridge-api
   pm2 save
   pm2 startup
   ```

8. **Configure Nginx** (`/etc/nginx/sites-available/vertex-ridge`):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # Frontend
       location / {
           root /var/www/vertex-ridge/dist;
           try_files $uri $uri/ /index.html;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

9. **Enable site & restart Nginx**:
   ```bash
   ln -s /etc/nginx/sites-available/vertex-ridge /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

10. **Setup SSL with Let's Encrypt**:
    ```bash
    apt-get install certbot python3-certbot-nginx
    certbot --nginx -d your-domain.com
    ```

---

## 📋 Pre-Deployment Checklist

### Database Setup (Supabase)

1. **Run all SQL migrations**:
   - `server/config/database.sql`
   - `server/config/admin_schema.sql`
   - `server/config/copy_trading_schema.sql`
   - `server/config/notifications_schema.sql`
   - `server/config/platform_settings_schema.sql`

2. **Create Storage Buckets**:
   - Go to Supabase Dashboard → Storage
   - Create bucket: `avatars` (public)
   - Create bucket: `kyc-documents` (private)

3. **Setup RLS Policies** (if needed)

### Environment Variables

**Backend (.env)**:
```env
NODE_ENV=production
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your_jwt_secret_min_32_chars
CORS_ORIGIN=https://your-frontend-domain.com

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_EMAIL=noreply@vertexridge.com
SMTP_FROM_NAME=Vertex Ridge
```

**Frontend (.env)**:
```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (min 32 characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable Supabase RLS policies
- [ ] Secure environment variables
- [ ] Set up monitoring/logging

---

## 🔄 CI/CD Setup (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: |
          npm install
          cd server && npm install
      
      - name: Build frontend
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 🎯 Recommended Setup for Production

**Best Practice Stack**:
- **Frontend**: Vercel (Free tier, automatic SSL, CDN)
- **Backend**: Render or Railway (Free tier available)
- **Database**: Supabase (Free tier: 500MB, 2GB bandwidth)
- **Monitoring**: Sentry (error tracking)
- **Analytics**: Vercel Analytics or Google Analytics

**Cost**: $0-20/month depending on traffic

---

## 🐛 Troubleshooting

### CORS Errors
- Ensure `CORS_ORIGIN` in backend matches your frontend URL
- Check if backend is running and accessible

### 401 Unauthorized
- Verify Supabase keys are correct
- Check JWT_SECRET is set
- Ensure session storage is working

### Build Failures
- Check Node.js version (use v18 or v20)
- Verify all dependencies are in package.json
- Check build logs for specific errors

### Database Connection Issues
- Verify Supabase URL and keys
- Check if IP is whitelisted (if using IP restrictions)
- Ensure database migrations are run

---

## 📞 Support

For deployment issues:
1. Check deployment platform logs
2. Verify environment variables
3. Test API endpoints with Postman
4. Check browser console for frontend errors

---

**Ready to deploy? Start with Option 1 (Vercel + Render) for the easiest setup!**
