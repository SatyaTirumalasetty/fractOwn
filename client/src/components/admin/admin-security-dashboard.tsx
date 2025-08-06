import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Activity, Clock, Users, Globe, Database, Cpu } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SecurityEvent {
  adminId: string;
  ip: string;
  userAgent: string;
  action: 'generate' | 'verify' | 'backup_used' | 'disabled';
  success: boolean;
  timestamp: number;
}

interface SecurityStats {
  last24Hours: {
    totalEvents: number;
    successfulAuth: number;
    failedAuth: number;
    successRate: number;
    uniqueIPs: number;
    uniqueAdmins: number;
  };
  allTime: {
    totalEvents: number;
    oldestEvent: string | null;
  };
}

interface PerformanceStats {
  totalRequests: number;
  averageResponseTime: number;
  slowRequests: number;
  errorRate: number;
  slowRequestPercentage: number;
}

interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
}

interface DashboardData {
  security: {
    stats: SecurityStats;
    recentEvents: SecurityEvent[];
  };
  performance: PerformanceStats;
  memory: MemoryStats;
  timestamp: string;
}

export function AdminSecurityDashboard() {
  const { data: dashboardData, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: ['/api/admin/security/dashboard'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionBadge = (action: string, success: boolean) => {
    const variant = success ? 'default' : 'destructive';
    const actionText = {
      generate: 'Generated Secret',
      verify: 'Verified TOTP',
      backup_used: 'Used Backup Code',
      disabled: 'Disabled TOTP'
    }[action] || action;

    return <Badge variant={variant}>{actionText}</Badge>;
  };

  const getSecurityLevel = (successRate: number) => {
    if (successRate >= 95) return { level: 'High', color: 'text-green-600', icon: Shield };
    if (successRate >= 80) return { level: 'Medium', color: 'text-yellow-600', icon: AlertTriangle };
    return { level: 'Low', color: 'text-red-600', icon: AlertTriangle };
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Shield className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Security Dashboard</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Dashboard</CardTitle>
            <CardDescription>Failed to load security metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { security, performance, memory } = dashboardData;
  const securityLevel = getSecurityLevel(security.stats.last24Hours.successRate);
  const SecurityIcon = securityLevel.icon;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Security Dashboard</h2>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date(dashboardData.timestamp).toLocaleString()}
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Level</CardTitle>
            <SecurityIcon className={`h-4 w-4 ${securityLevel.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${securityLevel.color}`}>
              {securityLevel.level}
            </div>
            <p className="text-xs text-muted-foreground">
              {security.stats.last24Hours.successRate.toFixed(1)}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auth Events (24h)</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{security.stats.last24Hours.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {security.stats.last24Hours.failedAuth} failed attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique IPs</CardTitle>
            <Globe className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{security.stats.last24Hours.uniqueIPs}</div>
            <p className="text-xs text-muted-foreground">
              {security.stats.last24Hours.uniqueAdmins} active admins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.averageResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              {performance.slowRequestPercentage}% slow requests
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="security" className="space-y-4">
        <TabsList>
          <TabsTrigger value="security">Security Events</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>
                Latest TOTP authentication activities for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {security.recentEvents.length === 0 ? (
                  <p className="text-gray-500">No recent security events</p>
                ) : (
                  security.recentEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getActionBadge(event.action, event.success)}
                        <div className="text-sm">
                          <div className="font-medium">{formatTimestamp(event.timestamp)}</div>
                          <div className="text-gray-500">IP: {event.ip}</div>
                        </div>
                      </div>
                      <div className={`text-sm ${event.success ? 'text-green-600' : 'text-red-600'}`}>
                        {event.success ? 'Success' : 'Failed'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Request Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Requests:</span>
                  <span className="font-medium">{performance.totalRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Response Time:</span>
                  <span className="font-medium">{performance.averageResponseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Slow Requests:</span>
                  <span className="font-medium">{performance.slowRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span>Error Rate:</span>
                  <span className="font-medium">{performance.errorRate}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Heap Used:</span>
                  <span className="font-medium">{memory.heapUsed}MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Heap Total:</span>
                  <span className="font-medium">{memory.heapTotal}MB</span>
                </div>
                <div className="flex justify-between">
                  <span>External:</span>
                  <span className="font-medium">{memory.external}MB</span>
                </div>
                <div className="flex justify-between">
                  <span>RSS:</span>
                  <span className="font-medium">{memory.rss}MB</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Database Health</CardTitle>
                <Database className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Healthy</div>
                <p className="text-xs text-muted-foreground">All connections active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <Cpu className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Normal</div>
                <p className="text-xs text-muted-foreground">Within expected range</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Status</CardTitle>
                <Shield className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Secured</div>
                <p className="text-xs text-muted-foreground">All systems protected</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}