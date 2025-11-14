const nodemailer = require("nodemailer");
const EmailConfig = require("../Models/EmailConfig.Model");

class EmailService {
  /**
   * Create transporter from email config
   */
  static async createTransporter(userId) {
    const config = await EmailConfig.findOne({ userId, isActive: true });

    if (!config) {
      throw new Error("Email configuration not found or inactive");
    }

    const transporter = nodemailer.createTransporter({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth: {
        user: config.smtpUser,
        pass: config.getDecryptedPassword(),
      },
    });

    return { transporter, config };
  }

  /**
   * Send test email
   */
  static async sendTestEmail(userId, toEmail) {
    try {
      const { transporter, config } = await this.createTransporter(userId);

      const info = await transporter.sendMail({
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: toEmail,
        subject: "Test Email - Villa Booking Platform",
        html: `
          <h2>Email Configuration Test</h2>
          <p>Congratulations! Your email configuration is working correctly.</p>
          <p>You can now receive notifications for:</p>
          <ul>
            <li>New bookings from connected platforms</li>
            <li>Villa publishing confirmations</li>
            <li>Booking synchronization reports</li>
          </ul>
          <p><strong>Villa Booking Platform</strong></p>
        `,
      });

      // Update last tested
      await EmailConfig.findOneAndUpdate(
        { userId },
        { lastTested: new Date(), testStatus: "success" }
      );

      return { success: true, messageId: info.messageId };
    } catch (error) {
      // Update test status
      await EmailConfig.findOneAndUpdate(
        { userId },
        { lastTested: new Date(), testStatus: "failed" }
      );

      throw new Error(`Failed to send test email: ${error.message}`);
    }
  }

  /**
   * Send booking confirmation email
   */
  static async sendBookingConfirmation(userId, booking) {
    try {
      const { transporter, config } = await this.createTransporter(userId);

      await transporter.sendMail({
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: config.smtpUser, // Send to owner
        subject: `New Booking: ${booking.guestName} - ${booking.startDate}`,
        html: `
          <h2>New Booking Received</h2>
          <p><strong>Guest:</strong> ${booking.guestName}</p>
          <p><strong>Check-in:</strong> ${new Date(booking.startDate).toLocaleDateString()}</p>
          <p><strong>Check-out:</strong> ${booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Total Fare:</strong> $${booking.totalFare}</p>
          <p><strong>Source:</strong> ${booking.bookingSource}</p>
          <p><strong>Status:</strong> ${booking.status}</p>
        `,
      });

      return { success: true };
    } catch (error) {
      console.error("Failed to send booking confirmation:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send villa publishing notification
   */
  static async sendPublishNotification(userId, villa, platforms, results) {
    try {
      const { transporter, config } = await this.createTransporter(userId);

      const successPlatforms = results.filter(r => r.success).map(r => r.platform);
      const failedPlatforms = results.filter(r => !r.success).map(r => r.platform);

      await transporter.sendMail({
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: config.smtpUser,
        subject: `Villa Published: ${villa.name}`,
        html: `
          <h2>Villa Publishing Report</h2>
          <p><strong>Villa:</strong> ${villa.name}</p>
          <p><strong>Location:</strong> ${villa.location}</p>

          ${successPlatforms.length > 0 ? `
            <h3 style="color: green;">Successfully Published:</h3>
            <ul>${successPlatforms.map(p => `<li>${p}</li>`).join('')}</ul>
          ` : ''}

          ${failedPlatforms.length > 0 ? `
            <h3 style="color: red;">Failed to Publish:</h3>
            <ul>${failedPlatforms.map(p => `<li>${p}</li>`).join('')}</ul>
          ` : ''}
        `,
      });

      return { success: true };
    } catch (error) {
      console.error("Failed to send publish notification:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send sync report
   */
  static async sendSyncReport(userId, platform, syncResult) {
    try {
      const { transporter, config } = await this.createTransporter(userId);

      await transporter.sendMail({
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: config.smtpUser,
        subject: `Booking Sync Report - ${platform}`,
        html: `
          <h2>Booking Synchronization Report</h2>
          <p><strong>Platform:</strong> ${platform}</p>
          <p><strong>New Bookings:</strong> ${syncResult.newBookings}</p>
          <p><strong>Updated Bookings:</strong> ${syncResult.updatedBookings}</p>
          <p><strong>Errors:</strong> ${syncResult.errors}</p>
          <p><strong>Sync Time:</strong> ${new Date().toLocaleString()}</p>
        `,
      });

      return { success: true };
    } catch (error) {
      console.error("Failed to send sync report:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = EmailService;
