export class NotificationService {
  
  // Generate a 6-digit OTP
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP via SMS/Email (development mode with console logging)
  async sendOTP(phoneNumber: string, email: string | undefined, otp: string): Promise<boolean> {
    try {
      // Development mode: Use fixed OTP for any phone number
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment) {
        console.log(`\n🔐 DEVELOPMENT OTP: 123456`);
        console.log(`📱 Phone: ${phoneNumber}`);
        if (email) {
          console.log(`📧 Email: ${email}`);
        }
        console.log(`⏰ For testing, always use: 123456\n`);
      } else {
        console.log(`\n🔐 OTP Login Code: ${otp}`);
        console.log(`📱 Phone: ${phoneNumber}`);
        if (email) {
          console.log(`📧 Email: ${email}`);
        }
        console.log(`⏰ Valid for 5 minutes\n`);
      }
      
      return true;
    } catch (error) {
      console.error("Failed to send OTP:", error);
      return false;
    }
  }

  // Send welcome notification
  async sendWelcomeNotification(phoneNumber: string, email?: string): Promise<boolean> {
    try {
      console.log(`🎉 Welcome notification sent to ${phoneNumber}`);
      if (email) {
        console.log(`📧 Welcome email sent to ${email}`);
      }
      return true;
    } catch (error) {
      console.error("Failed to send welcome notification:", error);
      return false;
    }
  }

  // Send SMS notification
  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      console.log(`📱 SMS sent to ${phoneNumber}: ${message}`);
      
      // In a real implementation, you would use Twilio or other SMS service
      // For development, we just log the message
      return true;
    } catch (error) {
      console.error("Failed to send SMS:", error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();