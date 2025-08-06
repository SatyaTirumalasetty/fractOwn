import { Request, Response, NextFunction } from 'express';

/**
 * Enhanced rate limiting with security-focused configurations
 * Implements sliding window rate limiting with memory optimization
 */

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  onLimitReached?: (req: Request) => void;
}

class SecurityRateLimiter {
  private windows: Map<string, { requests: number; resetTime: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    const expired: string[] = [];
    
    for (const [key, window] of this.windows.entries()) {
      if (now > window.resetTime) {
        expired.push(key);
      }
    }
    
    expired.forEach(key => this.windows.delete(key));
  }

  createLimiter(config: RateLimitConfig) {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = config.keyGenerator ? config.keyGenerator(req) : this.getDefaultKey(req);
      const now = Date.now();
      
      let window = this.windows.get(key);
      
      if (!window || now > window.resetTime) {
        window = {
          requests: 0,
          resetTime: now + config.windowMs
        };
        this.windows.set(key, window);
      }
      
      window.requests++;
      
      if (window.requests > config.maxRequests) {
        if (config.onLimitReached) {
          config.onLimitReached(req);
        }
        
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil((window.resetTime - now) / 1000)
        });
      }
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', config.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, config.maxRequests - window.requests));
      res.setHeader('X-RateLimit-Reset', Math.ceil(window.resetTime / 1000));
      
      next();
    };
  }

  private getDefaultKey(req: Request): string {
    // Use IP address and user agent for rate limiting key
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    return `${ip}:${userAgent}`;
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.windows.clear();
  }
}

export const securityRateLimiter = new SecurityRateLimiter();

// Pre-configured rate limiters for different endpoints
export const authRateLimiter = securityRateLimiter.createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
  onLimitReached: (req) => {
    console.warn(`Authentication rate limit exceeded for IP: ${req.ip}`);
  }
});

export const totpRateLimiter = securityRateLimiter.createLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 3, // 3 TOTP attempts per 5 minutes
  onLimitReached: (req) => {
    console.warn(`TOTP rate limit exceeded for IP: ${req.ip}`);
  }
});

export const adminRateLimiter = securityRateLimiter.createLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxRequests: 100, // 100 admin requests per 10 minutes
  onLimitReached: (req) => {
    console.warn(`Admin rate limit exceeded for IP: ${req.ip}`);
  }
});

export const generalRateLimiter = securityRateLimiter.createLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
  onLimitReached: (req) => {
    console.warn(`General rate limit exceeded for IP: ${req.ip}`);
  }
});