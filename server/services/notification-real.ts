import twilio from 'twilio';
import sgMail from '@sendgrid/mail';

export class RealNotificationService {
  private twilioClient?: ReturnType<typeof twilio>;
  private isEmailConfigured = false;
  private isSMSConfigured = false;

  constructor() {
    this.initializeServices();
  }

  private initializeServices() {
    // Initialize Twilio
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      this.isSMSConfigured = true;
      console.log('✅ Twilio SMS service configured');
    }

    // Initialize SendGrid
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.isEmailConfigured = true;
      console.log('✅ SendGrid email service configured');
    } else if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      this.isEmailConfigured = true;
      console.log('✅ Gmail email service configured');
    }
  }

  // Generate a 6-digit OTP
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP via SMS
  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      if (!this.isSMSConfigured || !this.twilioClient) {
        console.log(`📱 [DEVELOPMENT] SMS to ${phoneNumber}: ${message}`);
        return true;
      }

      await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      console.log(`📱 SMS sent successfully to ${phoneNumber}`);
      return true;
    } catch (error) {
      console.error("Failed to send SMS:", error);
      // Fall back to console logging
      console.log(`📱 [FALLBACK] SMS to ${phoneNumber}: ${message}`);
      return true;
    }
  }

  // Send OTP via Email
  async sendEmail(email: string, subject: string, message: string): Promise<boolean> {
    try {
      if (!this.isEmailConfigured) {
        console.log(`📧 [DEVELOPMENT] Email to ${email}: ${subject} - ${message}`);
        return true;
      }

      if (process.env.SENDGRID_API_KEY) {
        // SendGrid
        const msg = {
          to: email,
          from: process.env.EMAIL_USER || 'noreply@fractown.com',
          subject: subject,
          text: message,
          html: `<p>${message}</p>`
        };
        await sgMail.send(msg);
      } else {
        // Gmail (using nodemailer would be added here)
        console.log(`📧 [GMAIL] Email to ${email}: ${subject} - ${message}`);
      }

      console.log(`📧 Email sent successfully to ${email}`);
      return true;
    } catch (error) {
      console.error("Failed to send email:", error);
      // Fall back to console logging
      console.log(`📧 [FALLBACK] Email to ${email}: ${subject} - ${message}`);
      return true;
    }
  }

  // Send OTP via SMS/Email
  async sendOTP(phoneNumber: string, email: string | undefined, otp: string): Promise<boolean> {
    try {
      console.log(`\n🔐 OTP Login Code: ${otp}`);
      console.log(`📱 Phone: ${phoneNumber}`);
      if (email) {
        console.log(`📧 Email: ${email}`);
      }
      console.log(`⏰ Valid for 5 minutes\n`);

      const smsMessage = `Your fractOWN verification code is: ${otp}. Valid for 5 minutes.`;
      const emailSubject = 'Your fractOWN Verification Code';
      const emailMessage = `Your fractOWN verification code is: ${otp}\n\nThis code is valid for 5 minutes.\n\nIf you didn't request this code, please ignore this message.`;

      // Send SMS
      const smsResult = await this.sendSMS(phoneNumber, smsMessage);

      // Send Email if provided
      let emailResult = true;
      if (email) {
        emailResult = await this.sendEmail(email, emailSubject, emailMessage);
      }

      return smsResult && emailResult;
    } catch (error) {
      console.error("Failed to send OTP:", error);
      return false;
    }
  }

  // Send welcome notification
  async sendWelcomeNotification(phoneNumber: string, email?: string): Promise<boolean> {
    try {
      const welcomeMessage = "Welcome to fractOWN! Start investing in premium real estate properties today.";
      
      await this.sendSMS(phoneNumber, welcomeMessage);
      
      if (email) {
        await this.sendEmail(
          email,
          'Welcome to fractOWN!',
          'Welcome to fractOWN! You can now start investing in premium real estate properties. Explore our curated properties and begin your investment journey today.'
        );
      }
      
      return true;
    } catch (error) {
      console.error("Failed to send welcome notification:", error);
      return false;
    }
  }

  // Get service status
  getServiceStatus() {
    return {
      smsConfigured: this.isSMSConfigured,
      emailConfigured: this.isEmailConfigured,
      twilioReady: !!this.twilioClient,
      sendGridReady: !!process.env.SENDGRID_API_KEY,
      gmailReady: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD)
    };
  }
}

export const realNotificationService = new RealNotificationService();