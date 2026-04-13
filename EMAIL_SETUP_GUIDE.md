# Email Notification Setup Guide

This guide will help you configure email notifications for the TradZ platform using SMTP.

## Overview

The platform now includes an email notification system that sends:
- Welcome emails to new users
- Trade execution confirmations
- Deposit/withdrawal notifications
- KYC status updates
- Price alerts and other notifications

## Prerequisites

You'll need an SMTP email service. Here are the most common options:

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated 16-character password

3. **Update your `.env` file**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM_NAME=TradZ
SMTP_FROM_EMAIL=noreply@tradz.com
FRONTEND_URL=http://localhost:5173
```

### Option 2: SendGrid

1. Sign up at https://sendgrid.com
2. Create an API key
3. Update your `.env`:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM_NAME=TradZ
SMTP_FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### Option 3: AWS SES

1. Set up AWS SES and verify your domain
2. Get SMTP credentials from AWS Console
3. Update your `.env`:
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-aws-smtp-username
SMTP_PASS=your-aws-smtp-password
SMTP_FROM_NAME=TradZ
SMTP_FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### Option 4: Mailgun

1. Sign up at https://mailgun.com
2. Get SMTP credentials
3. Update your `.env`:
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
SMTP_FROM_NAME=TradZ
SMTP_FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

## Configuration

1. **Copy the example environment file**:
```bash
cd server
cp .env.example .env
```

2. **Edit `.env` and add your SMTP credentials** (see options above)

3. **Install dependencies** (if not already installed):
```bash
npm install
```

4. **Restart your server**:
```bash
npm run dev
```

## Testing Email Notifications

### Test Welcome Email
Sign up a new user and check the email inbox.

### Test Trade Notification
Execute a trade and verify the email is sent.

### Test from Node.js Console
```javascript
const emailService = require('./services/emailService');

// Test welcome email
emailService.sendWelcomeEmail({
  email: 'test@example.com',
  name: 'Test User'
}).then(result => console.log(result));
```

## Email Templates

All email templates are in `server/services/emailService.js`. You can customize:
- HTML templates
- Email subjects
- Sender name and email
- Email content and styling

## Troubleshooting

### Emails not sending

1. **Check SMTP credentials**: Verify username and password are correct
2. **Check firewall**: Ensure port 587 is not blocked
3. **Check logs**: Look for errors in server console
4. **Test SMTP connection**:
```javascript
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('SMTP Error:', error);
  } else {
    console.log('SMTP Ready!');
  }
});
```

### Gmail "Less secure app" error

- Gmail no longer supports "less secure apps"
- You MUST use an App Password (see Option 1 above)
- Regular Gmail password will NOT work

### Emails going to spam

1. **Set up SPF records** for your domain
2. **Set up DKIM** for email authentication
3. **Use a verified domain** (not Gmail for production)
4. **Warm up your IP** by sending gradually increasing volumes

## Production Recommendations

For production environments:

1. **Use a dedicated email service** (SendGrid, AWS SES, Mailgun)
2. **Set up a custom domain** for sending emails
3. **Configure SPF, DKIM, and DMARC** records
4. **Monitor email delivery rates** and bounce rates
5. **Implement email queuing** for high-volume sending
6. **Add unsubscribe links** to marketing emails
7. **Comply with CAN-SPAM** and GDPR regulations

## Email Queue (Optional Enhancement)

For high-volume production use, consider adding a queue system:

```bash
npm install bull redis
```

Then implement email queuing to handle failures and retries gracefully.

## Support

If you encounter issues:
1. Check server logs for error messages
2. Verify SMTP credentials are correct
3. Test SMTP connection independently
4. Check email service provider documentation
5. Ensure environment variables are loaded correctly

## Security Notes

- Never commit `.env` files to version control
- Use environment variables for all sensitive data
- Rotate SMTP credentials regularly
- Monitor for unauthorized email sending
- Implement rate limiting for email sending
