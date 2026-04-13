# TradZ Platform - Deployment Checklist

## Pre-Deployment

### Database Setup
- [ ] Run `server/config/database.sql` in Supabase SQL Editor
- [ ] Run `server/config/admin_schema.sql` for admin features
- [ ] Run `server/config/notifications_schema.sql` for notifications
- [ ] Run `server/config/copy_trading_schema.sql` for copy trading
- [ ] Verify all tables created successfully
- [ ] Check Row Level Security (RLS) policies are enabled
- [ ] Create initial admin user account

### Environment Variables

#### Backend (.env)
- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- [ ] `GOOGLE_CLIENT_ID` - Google OAuth client ID
- [ ] `JWT_SECRET` - Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- [ ] `CORS_ORIGIN` - Frontend URL(s)
- [ ] `SMTP_HOST` - Email server host
- [ ] `SMTP_PORT` - Email server port (usually 587)
- [ ] `SMTP_USER` - Email username
- [ ] `SMTP_PASS` - Email password/app password
- [ ] `SMTP_FROM_NAME` - Sender name
- [ ] `SMTP_FROM_EMAIL` - Sender email
- [ ] `FRONTEND_URL` - Your frontend URL
- [ ] `NODE_ENV=production`

#### Frontend (.env)
- [ ] `VITE_API_URL` - Backend API URL
- [ ] `VITE_SUPABASE_URL` - Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID

### Security
- [ ] Change all default passwords
- [ ] Generate strong JWT secret
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable Supabase RLS policies
- [ ] Review and test authentication flows
- [ ] Set up firewall rules
- [ ] Configure CSP headers

### Email Configuration
- [ ] Set up SMTP service (Gmail, SendGrid, AWS SES, etc.)
- [ ] Generate app-specific password (if using Gmail)
- [ ] Test email sending
- [ ] Verify welcome emails work
- [ ] Test trade notification emails
- [ ] Configure SPF/DKIM records (production)

### Google OAuth
- [ ] Create Google Cloud project
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 credentials
- [ ] Add authorized redirect URIs
- [ ] Test Google login flow

### Admin Setup
- [ ] Create admin user in database
- [ ] Test admin login
- [ ] Verify admin dashboard access
- [ ] Test user management features
- [ ] Test platform settings updates
- [ ] Review activity logs

## Deployment

### Backend Deployment

#### Option 1: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set SUPABASE_URL=your-url
# ... add all other variables

# Deploy
railway up
```

#### Option 2: Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Add environment variables
heroku config:set SUPABASE_URL=your-url
# ... add all other variables

# Deploy
git push heroku main
```

#### Option 3: VPS (DigitalOcean, AWS EC2, etc.)
```bash
# SSH into server
ssh user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone your-repo-url
cd your-repo/server

# Install dependencies
npm install --production

# Set up environment variables
nano .env
# Add all variables

# Install PM2
npm install -g pm2

# Start application
pm2 start index.js --name tradz-api

# Set up PM2 to start on boot
pm2 startup
pm2 save

# Set up Nginx reverse proxy
sudo apt install nginx
sudo nano /etc/nginx/sites-available/tradz
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Frontend Deployment

#### Option 1: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Settings > Environment Variables
```

#### Option 2: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist

# Add environment variables in Netlify dashboard
# Site settings > Environment variables
```

#### Option 3: Static Hosting (S3, CloudFlare Pages, etc.)
```bash
# Build
npm run build

# Upload dist/ folder to your hosting service
```

## Post-Deployment

### Testing
- [ ] Test user registration
- [ ] Test user login
- [ ] Test Google OAuth login
- [ ] Test email notifications
- [ ] Test trading functionality
- [ ] Test deposit/withdrawal
- [ ] Test admin dashboard
- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Load testing (optional)

### Monitoring
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring
- [ ] Enable database monitoring
- [ ] Configure log aggregation
- [ ] Set up alerts for critical errors

### DNS & SSL
- [ ] Point domain to backend server
- [ ] Point domain to frontend hosting
- [ ] Set up SSL certificates (Let's Encrypt)
- [ ] Configure DNS records
- [ ] Test HTTPS connections
- [ ] Set up CDN (optional)

### Backup
- [ ] Configure automated database backups
- [ ] Test backup restoration
- [ ] Set up file storage backups
- [ ] Document backup procedures

### Documentation
- [ ] Update README with deployment info
- [ ] Document API endpoints
- [ ] Create user guide
- [ ] Create admin guide
- [ ] Document troubleshooting steps

## Maintenance

### Regular Tasks
- [ ] Monitor error logs daily
- [ ] Review admin activity logs weekly
- [ ] Check database performance weekly
- [ ] Update dependencies monthly
- [ ] Review security patches monthly
- [ ] Test backups monthly
- [ ] Review user feedback regularly

### Updates
- [ ] Create staging environment
- [ ] Test updates in staging
- [ ] Schedule maintenance windows
- [ ] Notify users of downtime
- [ ] Deploy updates
- [ ] Verify deployment
- [ ] Monitor for issues

## Rollback Plan

If deployment fails:

1. **Backend Rollback**:
```bash
# Railway
railway rollback

# Heroku
heroku rollback

# PM2
pm2 restart tradz-api --update-env
```

2. **Frontend Rollback**:
```bash
# Vercel
vercel rollback

# Netlify
netlify rollback
```

3. **Database Rollback**:
- Restore from latest backup
- Run migration rollback scripts

## Support Contacts

- **Supabase Support**: https://supabase.com/support
- **Hosting Support**: Check your hosting provider
- **Email Service Support**: Check your SMTP provider

## Performance Optimization

- [ ] Enable gzip compression
- [ ] Optimize images
- [ ] Implement caching strategies
- [ ] Use CDN for static assets
- [ ] Optimize database queries
- [ ] Enable HTTP/2
- [ ] Minify CSS/JS
- [ ] Lazy load images

## Security Hardening

- [ ] Enable HTTPS only
- [ ] Set security headers
- [ ] Implement rate limiting
- [ ] Enable CSRF protection
- [ ] Sanitize user inputs
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Monitor for vulnerabilities

## Compliance

- [ ] Add privacy policy
- [ ] Add terms of service
- [ ] Implement GDPR compliance (if applicable)
- [ ] Add cookie consent
- [ ] Implement data export feature
- [ ] Implement account deletion
- [ ] Add email unsubscribe links

## Success Metrics

Track these metrics post-deployment:
- User registration rate
- Login success rate
- Trade execution success rate
- Email delivery rate
- API response times
- Error rates
- User retention
- Platform uptime

## Emergency Contacts

Document emergency contacts for:
- DevOps team
- Database administrator
- Security team
- Hosting provider support
- Domain registrar support
