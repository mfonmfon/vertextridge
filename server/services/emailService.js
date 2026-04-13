const nodemailer = require('nodemailer');
const Logger = require('../utils/logger');
const logger = new Logger('EMAIL_SERVICE');

/**
 * Email Service for sending notifications via SMTP
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      logger.info('Email transporter initialized');
    } catch (error) {
      logger.error('Failed to initialize email transporter', { error: error.message });
    }
  }

  async sendEmail({ to, subject, html, text }) {
    if (!this.transporter) {
      logger.warn('Email transporter not initialized');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'TradZ'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html
      });

      logger.info('Email sent successfully', { to, subject, messageId: info.messageId });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Failed to send email', { to, subject, error: error.message });
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #a3e635; color: #000; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #a3e635; color: #000; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to TradZ! 🎉</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.name},</h2>
            <p>Thank you for joining TradZ! We're excited to have you on board.</p>
            <p>Your account has been successfully created with an initial balance of <strong>$50.00</strong> to get you started.</p>
            <p>Here's what you can do next:</p>
            <ul>
              <li>Complete your KYC verification for full access</li>
              <li>Explore the markets and start trading</li>
              <li>Set up your portfolio and watchlist</li>
              <li>Enable two-factor authentication for extra security</li>
            </ul>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">Go to Dashboard</a>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Happy Trading!</p>
            <p><strong>The TradZ Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2024 TradZ. All rights reserved.</p>
            <p>This email was sent to ${user.email}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Welcome to TradZ - Your Trading Journey Starts Here!',
      html,
      text: `Hi ${user.name}, Welcome to TradZ! Your account has been created with $50.00 initial balance.`
    });
  }

  async sendTradeNotification(user, trade) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${trade.type === 'buy' ? '#22c55e' : '#ef4444'}; color: #fff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .trade-details { background: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${trade.type === 'buy' ? '✅ Buy' : '📤 Sell'} Order Executed</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.name},</h2>
            <p>Your ${trade.type} order has been successfully executed.</p>
            <div class="trade-details">
              <div class="detail-row">
                <span><strong>Asset:</strong></span>
                <span>${trade.symbol} - ${trade.name}</span>
              </div>
              <div class="detail-row">
                <span><strong>Quantity:</strong></span>
                <span>${trade.quantity}</span>
              </div>
              <div class="detail-row">
                <span><strong>Price:</strong></span>
                <span>$${parseFloat(trade.price).toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <span><strong>Total:</strong></span>
                <span>$${parseFloat(trade.total).toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <span><strong>Status:</strong></span>
                <span style="color: #22c55e; font-weight: bold;">${trade.status}</span>
              </div>
            </div>
            <p>You can view this trade in your portfolio dashboard.</p>
            <p><strong>The TradZ Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2024 TradZ. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: user.email,
      subject: `Trade Executed: ${trade.type.toUpperCase()} ${trade.symbol}`,
      html,
      text: `Your ${trade.type} order for ${trade.quantity} ${trade.symbol} at $${trade.price} has been executed.`
    });
  }

  async sendDepositNotification(user, transaction) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #22c55e; color: #fff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .amount { font-size: 36px; font-weight: bold; color: #22c55e; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Deposit Successful</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.name},</h2>
            <p>Your deposit has been successfully processed!</p>
            <div class="amount">$${parseFloat(transaction.amount).toFixed(2)}</div>
            <p><strong>Method:</strong> ${transaction.method}</p>
            <p><strong>Status:</strong> ${transaction.status}</p>
            <p>Your new balance is available for trading immediately.</p>
            <p><strong>The TradZ Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2024 TradZ. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Deposit Successful - Funds Added to Your Account',
      html,
      text: `Your deposit of $${transaction.amount} has been successfully processed.`
    });
  }

  async sendKYCStatusUpdate(user, status) {
    const statusMessages = {
      verified: { title: '✅ KYC Verified', message: 'Congratulations! Your identity has been verified.', color: '#22c55e' },
      rejected: { title: '❌ KYC Rejected', message: 'Unfortunately, your KYC verification was not successful.', color: '#ef4444' },
      pending: { title: '⏳ KYC Under Review', message: 'Your KYC documents are being reviewed.', color: '#f59e0b' }
    };

    const statusInfo = statusMessages[status] || statusMessages.pending;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${statusInfo.color}; color: #fff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${statusInfo.title}</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.name},</h2>
            <p>${statusInfo.message}</p>
            ${status === 'verified' ? '<p>You now have access to all platform features and higher trading limits.</p>' : ''}
            ${status === 'rejected' ? '<p>Please contact our support team for more information or to resubmit your documents.</p>' : ''}
            <p><strong>The TradZ Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2024 TradZ. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: user.email,
      subject: `KYC Status Update: ${status.toUpperCase()}`,
      html,
      text: `Your KYC status has been updated to: ${status}`
    });
  }
}

module.exports = new EmailService();
