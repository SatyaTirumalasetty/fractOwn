import { Request, Response, NextFunction } from 'express';

/**
 * Performance monitoring and optimization system
 * Tracks response times, memory usage, and database performance
 */

interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  timestamp: number;
  endpoint: string;
  method: string;
  statusCode: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics in memory
  private slowQueryThreshold = 1000; // 1 second
  private memoryWarningThreshold = 100 * 1024 * 1024; // 100MB

  /**
   * Express middleware for performance monitoring
   */
  createMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = process.hrtime.bigint();
      const startCpuUsage = process.cpuUsage();
      const startMemory = process.memoryUsage();

      // Override res.end to capture metrics
      const originalEnd = res.end;
      res.end = function(chunk?: any, encoding?: any) {
        const endTime = process.hrtime.bigint();
        const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
        const endCpuUsage = process.cpuUsage(startCpuUsage);
        const endMemory = process.memoryUsage();

        const metrics: PerformanceMetrics = {
          responseTime,
          memoryUsage: endMemory,
          cpuUsage: endCpuUsage,
          timestamp: Date.now(),
          endpoint: req.path,
          method: req.method,
          statusCode: res.statusCode
        };

        // Add to metrics array
        if (performanceMonitor.metrics.length >= performanceMonitor.maxMetrics) {
          performanceMonitor.metrics.shift(); // Remove oldest
        }
        performanceMonitor.metrics.push(metrics);

        // Log slow queries
        if (responseTime > performanceMonitor.slowQueryThreshold) {
          console.warn(`Slow request detected: ${req.method} ${req.path} took ${responseTime.toFixed(2)}ms`);
        }

        // Log memory warnings
        if (endMemory.heapUsed > performanceMonitor.memoryWarningThreshold) {
          console.warn(`High memory usage: ${(endMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
        }

        return originalEnd.call(res, chunk, encoding);
      };

      next();
    };
  }

  /**
   * Get performance statistics
   */
  getStats() {
    if (this.metrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        slowRequests: 0,
        errorRate: 0
      };
    }

    const totalRequests = this.metrics.length;
    const averageResponseTime = this.metrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests;
    const slowRequests = this.metrics.filter(m => m.responseTime > this.slowQueryThreshold).length;
    const errorRequests = this.metrics.filter(m => m.statusCode >= 400).length;
    const errorRate = (errorRequests / totalRequests) * 100;

    return {
      totalRequests,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      slowRequests,
      errorRate: Math.round(errorRate * 100) / 100,
      slowRequestPercentage: Math.round((slowRequests / totalRequests) * 100 * 100) / 100
    };
  }

  /**
   * Get endpoint-specific performance data
   */
  getEndpointStats() {
    const endpointMap = new Map<string, PerformanceMetrics[]>();
    
    this.metrics.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`;
      if (!endpointMap.has(key)) {
        endpointMap.set(key, []);
      }
      endpointMap.get(key)!.push(metric);
    });

    const endpointStats = Array.from(endpointMap.entries()).map(([endpoint, metrics]) => {
      const averageResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
      const slowRequests = metrics.filter(m => m.responseTime > this.slowQueryThreshold).length;
      const errorRequests = metrics.filter(m => m.statusCode >= 400).length;
      
      return {
        endpoint,
        requestCount: metrics.length,
        averageResponseTime: Math.round(averageResponseTime * 100) / 100,
        slowRequests,
        errorRate: Math.round((errorRequests / metrics.length) * 100 * 100) / 100
      };
    });

    return endpointStats.sort((a, b) => b.averageResponseTime - a.averageResponseTime);
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats() {
    if (this.metrics.length === 0) return null;

    const latestMemory = this.metrics[this.metrics.length - 1].memoryUsage;
    return {
      heapUsed: Math.round(latestMemory.heapUsed / 1024 / 1024 * 100) / 100, // MB
      heapTotal: Math.round(latestMemory.heapTotal / 1024 / 1024 * 100) / 100, // MB
      external: Math.round(latestMemory.external / 1024 / 1024 * 100) / 100, // MB
      rss: Math.round(latestMemory.rss / 1024 / 1024 * 100) / 100, // MB
    };
  }

  /**
   * Clear metrics (useful for testing or resetting)
   */
  clearMetrics() {
    this.metrics = [];
  }

  /**
   * Force garbage collection if available
   */
  forceGarbageCollection() {
    if (global.gc) {
      global.gc();
      console.log('Garbage collection forced');
    } else {
      console.log('Garbage collection not available. Start Node.js with --expose-gc flag.');
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Database query performance tracker
 */
export class DatabaseMonitor {
  private queryTimes: Map<string, number[]> = new Map();
  private slowQueryThreshold = 500; // 500ms

  trackQuery(queryName: string, startTime: number) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    if (!this.queryTimes.has(queryName)) {
      this.queryTimes.set(queryName, []);
    }
    
    const times = this.queryTimes.get(queryName)!;
    times.push(duration);
    
    // Keep only last 100 query times per query type
    if (times.length > 100) {
      times.shift();
    }

    // Log slow queries
    if (duration > this.slowQueryThreshold) {
      console.warn(`Slow database query: ${queryName} took ${duration}ms`);
    }
  }

  getQueryStats() {
    const stats: any = {};
    
    for (const [queryName, times] of this.queryTimes.entries()) {
      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const slowQueries = times.filter(time => time > this.slowQueryThreshold).length;
      
      stats[queryName] = {
        totalQueries: times.length,
        averageTime: Math.round(averageTime * 100) / 100,
        slowQueries,
        slowQueryPercentage: Math.round((slowQueries / times.length) * 100 * 100) / 100
      };
    }
    
    return stats;
  }
}

export const databaseMonitor = new DatabaseMonitor();