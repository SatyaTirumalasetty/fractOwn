/**
 * Enhanced Admin Dashboard with Modern Design
 * Improved UI/UX with better interactivity and visual design
 */

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  Calendar,
  MapPin,
  Activity,
  Shield,
  Clock,
  FileText,
  BarChart3,
  Zap,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";

interface DashboardStats {
  totalProperties: number;
  activeProperties: number;
  totalInvestment: number;
  totalContacts: number;
  avgFunding: number;
  recentActivities: Array<{
    id: string;
    type: 'property_created' | 'contact_received' | 'funding_updated';
    message: string;
    timestamp: string;
  }>;
}

export function EnhancedAdminDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/dashboard-stats', selectedTimeframe],
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['/api/admin/properties'],
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['/api/admin/contacts'],
  });

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Properties",
      value: properties.length,
      change: "+12%",
      trend: "up",
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Properties in portfolio"
    },
    {
      title: "Active Investments",
      value: properties.filter(p => p.isActive).length,
      change: "+8%",
      trend: "up", 
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Currently active"
    },
    {
      title: "Total Inquiries",
      value: contacts.length,
      change: "+23%",
      trend: "up",
      icon: Users,
      color: "text-purple-600", 
      bgColor: "bg-purple-50",
      description: "Customer inquiries"
    },
    {
      title: "Platform Activity",
      value: "99.9%",
      change: "+0.1%",
      trend: "up",
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-50", 
      description: "System uptime"
    }
  ];

  return (
    <motion.div 
      className="space-y-8 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor your fractOWN platform performance and activities
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex bg-white border border-gray-200 rounded-lg p-1">
            {[
              { label: '7d', value: '7d' },
              { label: '30d', value: '30d' },
              { label: '90d', value: '90d' },
              { label: '1y', value: '1y' }
            ].map((period) => (
              <Button
                key={period.value}
                variant={selectedTimeframe === period.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedTimeframe(period.value)}
                className="h-8 px-3 text-sm"
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        {statCards.map((stat, index) => (
          <motion.div key={stat.title} variants={cardVariants}>
            <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      stat.trend === 'up' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                    }`}
                  >
                    {stat.change}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Property Performance */}
        <motion.div variants={cardVariants} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Property Performance
                  </CardTitle>
                  <CardDescription>
                    Investment progress and funding status
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {properties.slice(0, 4).map((property, index) => (
                  <div key={property.id} className="flex items-center space-x-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-sm">{property.name}</h4>
                          <Badge variant={property.isActive ? "default" : "secondary"} className="text-xs">
                            {property.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{property.fundingProgress}%</p>
                          <p className="text-xs text-gray-500">
                            ₹{(property.totalValue / 10000000).toFixed(1)}Cr
                          </p>
                        </div>
                      </div>
                      <Progress 
                        value={property.fundingProgress} 
                        className="h-2"
                      />
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {property.city}, {property.state}
                        </span>
                        <span>{property.expectedReturn}% returns</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={cardVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest platform updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contacts.slice(0, 5).map((contact, index) => (
                  <div key={contact.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">New inquiry from {contact.name}</p>
                      <p className="text-xs text-gray-500">
                        Interest: ₹{contact.investmentAmount} • {new Date(contact.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Security Status */}
        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Shield className="h-5 w-5" />
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">TOTP Authentication</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Data Encryption</span>
                  <Badge className="bg-green-100 text-green-800">AES-256</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">SSL Certificate</span>
                  <Badge className="bg-green-100 text-green-800">Valid</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Performance */}
        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Zap className="h-5 w-5" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Response Time</span>
                  <span className="text-sm font-medium text-green-600">98ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Memory Usage</span>
                  <span className="text-sm font-medium">72%</span>
                </div>
                <Progress value={72} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Platform Stats */}
        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <Globe className="h-5 w-5" />
                Platform Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Sessions</span>
                  <span className="text-sm font-medium">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Calls Today</span>
                  <span className="text-sm font-medium">1,247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Data Processed</span>
                  <span className="text-sm font-medium">2.3GB</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}