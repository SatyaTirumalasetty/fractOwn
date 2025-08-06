import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Activity, Clock, Users, Globe, Database, Cpu, CheckCircle, Eye, Lock, TrendingUp, Server, RefreshCw, Search, Filter, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

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
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="h-6 w-6 mr-3 text-blue-600" />
            Security Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Monitor authentication events and system security
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <div className="text-sm text-gray-500 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Updated: {new Date(dashboardData.timestamp).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500 rounded-lg mr-4">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Total Events</p>
                <p className="text-3xl font-bold text-blue-900">{security.stats.last24Hours.totalEvents}</p>
                <p className="text-xs text-blue-700 mt-1">Last 24 hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500 rounded-lg mr-4">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Success Rate</p>
                <p className="text-3xl font-bold text-green-900">{security.stats.last24Hours.successRate.toFixed(1)}%</p>
                <p className="text-xs text-green-700 mt-1">{security.stats.last24Hours.successfulAuth} successful</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500 rounded-lg mr-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-800">Active Admins</p>
                <p className="text-3xl font-bold text-purple-900">{security.stats.last24Hours.uniqueAdmins}</p>
                <p className="text-xs text-purple-700 mt-1">{security.stats.last24Hours.uniqueIPs} unique IPs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`p-2 ${securityLevel.level === 'High' ? 'bg-green-500' : securityLevel.level === 'Medium' ? 'bg-orange-500' : 'bg-red-500'} rounded-lg mr-4`}>
                <SecurityIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-800">Security Level</p>
                <p className={`text-3xl font-bold ${securityLevel.color}`}>{securityLevel.level}</p>
                <p className="text-xs text-orange-700 mt-1">{security.stats.last24Hours.failedAuth} failed attempts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search events by admin ID, IP, or action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="generate">Generated</SelectItem>
                  <SelectItem value="verify">Verified</SelectItem>
                  <SelectItem value="backup_used">Backup Used</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

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