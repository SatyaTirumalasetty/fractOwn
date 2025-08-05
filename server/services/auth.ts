import { db } from "../db";
import { users, otpVerifications, userSessions, type InsertUser, type User } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";
import { nanoid } from "nanoid";
import { notificationService } from "./notification";

export class AuthService {
  
  // Generate and send OTP
  async sendOTP(phoneNumber: string, email?: string): Promise<{ success: boolean; message: string }> {
    try {
      // Clean up old OTPs for this phone number
      await db.delete(otpVerifications)
        .where(eq(otpVerifications.phoneNumber, phoneNumber));

      // Generate new OTP
      const otp = notificationService.generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Save OTP to database
      await db.insert(otpVerifications).values({
        phoneNumber,
        otp,
        expiresAt
      });

      // Send OTP via SMS/Email
      const sent = await notificationService.sendOTP(phoneNumber, email, otp);
      
      if (sent) {
        return { success: true, message: "OTP sent successfully" };
      } else {
        return { success: false, message: "Failed to send OTP" };
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      return { success: false, message: "Failed to send OTP" };
    }
  }

  // Verify OTP and create/login user
  async verifyOTPAndLogin(phoneNumber: string, otp: string, name?: string, countryCode?: string): Promise<{
    success: boolean;
    message: string;
    user?: User;
    sessionToken?: string;
  }> {
    try {
      // Check if OTP exists and is valid
      const [otpRecord] = await db.select()
        .from(otpVerifications)
        .where(
          and(
            eq(otpVerifications.phoneNumber, phoneNumber),
            eq(otpVerifications.otp, otp),
            eq(otpVerifications.isUsed, false),
            gt(otpVerifications.expiresAt, new Date())
          )
        );

      if (!otpRecord) {
        return { success: false, message: "Invalid or expired OTP" };
      }

      // Mark OTP as used
      await db.update(otpVerifications)
        .set({ isUsed: true })
        .where(eq(otpVerifications.id, otpRecord.id));

      // Check if user exists
      let [user] = await db.select()
        .from(users)
        .where(eq(users.phoneNumber, phoneNumber));

      // If user doesn't exist, create new user
      if (!user) {
        if (!name || !countryCode) {
          return { success: false, message: "Name and country code required for new users" };
        }

        const [newUser] = await db.insert(users).values({
          name,
          countryCode,
          phoneNumber,
          isVerified: true
        }).returning();

        user = newUser;

        // Send welcome notification
        await notificationService.sendWelcome(phoneNumber, name);
      } else {
        // Update verification status if not already verified
        if (!user.isVerified) {
          [user] = await db.update(users)
            .set({ isVerified: true })
            .where(eq(users.id, user.id))
            .returning();
        }
      }

      // Create session
      const sessionToken = nanoid(32);
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      await db.insert(userSessions).values({
        userId: user.id,
        sessionToken,
        expiresAt
      });

      return {
        success: true,
        message: "Login successful",
        user,
        sessionToken
      };

    } catch (error) {
      console.error("Verify OTP error:", error);
      return { success: false, message: "Verification failed" };
    }
  }

  // Validate session token
  async validateSession(sessionToken: string): Promise<User | null> {
    try {
      const [session] = await db.select({
        user: users,
        session: userSessions
      })
      .from(userSessions)
      .innerJoin(users, eq(userSessions.userId, users.id))
      .where(
        and(
          eq(userSessions.sessionToken, sessionToken),
          gt(userSessions.expiresAt, new Date())
        )
      );

      return session?.user || null;
    } catch (error) {
      console.error("Validate session error:", error);
      return null;
    }
  }

  // Logout user
  async logout(sessionToken: string): Promise<boolean> {
    try {
      await db.delete(userSessions)
        .where(eq(userSessions.sessionToken, sessionToken));
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  }
}

export const authService = new AuthService();