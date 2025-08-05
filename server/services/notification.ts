import { MailService } from '@sendgrid/mail';

// SMS Service Interface
interface SMSService {
  sendOTP(phoneNumber: string, otp: string): Promise<boolean>;
  sendWelcome(phoneNumber: string, name: string): Promise<boolean>;
}

// Email Service Interface  
interface EmailService {
  sendOTP(email: string, otp: string): Promise<boolean>;
  sendWelcome(email: string, name: string): Promise<boolean>;
}

// Twilio SMS Implementation (placeholder for when API keys are provided)
class TwilioSMSService implements SMSService {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;
  
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';
  }

  async sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log(`SMS OTP would be sent to ${phoneNumber}: ${otp}`);
      return true; // Return true for development
    }

    try {
      // Actual Twilio implementation would go here
      const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + this.accountSid + '/Messages.json', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(this.accountSid + ':' + this.authToken).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'From': this.fromNumber,
          'To': phoneNumber,
          'Body': `Your fractOWN verification code is: ${otp}. Valid for 5 minutes.`
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('SMS sending failed:', error);
      return false;
    }
  }

  async sendWelcome(phoneNumber: string, name: string): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log(`Welcome SMS would be sent to ${phoneNumber} for ${name}`);
      return true;
    }

    try {
      const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + this.accountSid + '/Messages.json', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(this.accountSid + ':' + this.authToken).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'From': this.fromNumber,
          'To': phoneNumber,
          'Body': `Welcome to fractOWN, ${name}! Start investing in premium real estate with just ₹10L.`
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Welcome SMS failed:', error);
      return false;
    }
  }

  private isConfigured(): boolean {
    return !!(this.accountSid && this.authToken && this.fromNumber);
  }
}

// SendGrid Email Implementation
class SendGridEmailService implements EmailService {
  private mailService: MailService;
  private fromEmail: string;
  
  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@fractown.com';
    this.mailService = new MailService();
    
    if (process.env.SENDGRID_API_KEY) {
      this.mailService.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }

  async sendOTP(email: string, otp: string): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log(`Email OTP would be sent to ${email}: ${otp}`);
      return true; // Return true for development
    }

    try {
      await this.mailService.send({
        to: email,
        from: this.fromEmail,
        subject: 'Your fractOWN Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verify Your Account</h2>
            <p>Your verification code is:</p>
            <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
              ${otp}
            </div>
            <p>This code will expire in 5 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `
      });
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async sendWelcome(email: string, name: string): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log(`Welcome email would be sent to ${email} for ${name}`);
      return true;
    }

    try {
      await this.mailService.send({
        to: email,
        from: this.fromEmail,
        subject: 'Welcome to fractOWN!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to fractOWN, ${name}!</h2>
            <p>Thank you for joining India's premier fractional real estate investment platform.</p>
            <p>You can now:</p>
            <ul>
              <li>Browse premium properties in major cities</li>
              <li>Start investing with just ₹10L</li>
              <li>Track your investment portfolio</li>
              <li>Receive regular updates on your investments</li>
            </ul>
            <p>Happy investing!</p>
            <p>The fractOWN Team</p>
          </div>
        `
      });
      return true;
    } catch (error) {
      console.error('Welcome email failed:', error);
      return false;
    }
  }

  private isConfigured(): boolean {
    return !!process.env.SENDGRID_API_KEY;
  }
}

// Notification Service
export class NotificationService {
  private smsService: SMSService;
  private emailService: EmailService;

  constructor() {
    this.smsService = new TwilioSMSService();
    this.emailService = new SendGridEmailService();
  }

  async sendOTP(phoneNumber: string, email?: string, otp?: string): Promise<boolean> {
    // Generate OTP if not provided
    const otpCode = otp || this.generateOTP();
    
    const smsResult = await this.smsService.sendOTP(phoneNumber, otpCode);
    let emailResult = true;
    
    if (email) {
      emailResult = await this.emailService.sendOTP(email, otpCode);
    }
    
    return smsResult && emailResult;
  }

  async sendWelcome(phoneNumber: string, name: string, email?: string): Promise<boolean> {
    const smsResult = await this.smsService.sendWelcome(phoneNumber, name);
    let emailResult = true;
    
    if (email) {
      emailResult = await this.emailService.sendWelcome(email, name);
    }
    
    return smsResult && emailResult;
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

export const notificationService = new NotificationService();