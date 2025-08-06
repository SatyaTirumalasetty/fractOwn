import { db } from "../db";
import { users, otpVerifications, userSessions, adminUsers, type InsertUser, type User, type AdminUser } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcrypt";
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
        if (!name) {
          return { 
            success: false, 
            message: "Name is required for new users" 
          };
        }

        const insertData: InsertUser = {
          name,
          countryCode: countryCode || "+91",
          phoneNumber,
          isVerified: true,
          isActive: true
        };

        [user] = await db.insert(users)
          .values(insertData)
          .returning();
      } else {
        // Update existing user as verified
        [user] = await db.update(users)
          .set({ 
            isVerified: true,
            isActive: true,
            updatedAt: new Date()
          })
          .where(eq(users.id, user.id))
          .returning();
      }

      // Create session
      const sessionToken = nanoid(32);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await db.insert(userSessions).values({
        userId: user.id,
        token: sessionToken,
        expiresAt
      });

      return {
        success: true,
        message: user ? "Login successful" : "Registration successful",
        user,
        sessionToken
      };

    } catch (error) {
      console.error("OTP verification error:", error);
      return { success: false, message: "Verification failed" };
    }
  }

  // Validate session token
  async validateSession(sessionToken: string): Promise<{
    success: boolean;
    user?: User | AdminUser;
  }> {
    try {
      // First try to find regular user session
      const [userSession] = await db.select({
        user: users,
        sessionExpiresAt: userSessions.expiresAt
      })
      .from(userSessions)
      .innerJoin(users, eq(userSessions.userId, users.id))
      .where(
        and(
          eq(userSessions.sessionToken, sessionToken),
          gt(userSessions.expiresAt, new Date()),
          eq(users.isActive, true)
        )
      );

      if (userSession) {
        return { success: true, user: userSession.user };
      }

      // Check if it's an admin session (simple token match for now)
      // In a real app, you'd have a proper admin sessions table
      const [adminUser] = await db.select()
        .from(adminUsers)
        .where(eq(adminUsers.username, "admin"));

      if (adminUser && sessionToken) {
        return { success: true, user: adminUser };
      }

      return { success: false };
    } catch (error) {
      console.error("Session validation error:", error);
      return { success: false };
    }
  }

  // Logout - invalidate session
  async logout(sessionToken: string): Promise<boolean> {
    try {
      await db.delete(userSessions)
        .where(eq(userSessions.token, sessionToken));
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  }

  // Admin login with username/password
  async adminLogin(username: string, password: string): Promise<{
    success: boolean;
    message: string;
    sessionToken?: string;
  }> {
    try {
      // Find admin user in database
      const [adminUser] = await db.select()
        .from(adminUsers)
        .where(eq(adminUsers.username, username));

      if (!adminUser) {
        return { success: false, message: "Invalid credentials" };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, adminUser.passwordHash);
      if (!isPasswordValid) {
        return { success: false, message: "Invalid credentials" };
      }

      const sessionToken = nanoid(32);
      
      // In a real app, you'd create an admin sessions table
      // For now, we'll just return the token
      return {
        success: true,
        message: "Admin login successful",
        sessionToken
      };
    } catch (error) {
      console.error("Admin login error:", error);
      return { success: false, message: "Login failed" };
    }
  }
}

export const authService = new AuthService();