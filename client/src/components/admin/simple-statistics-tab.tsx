import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, TrendingUp, Users, Building, MapPin, IndianRupee } from "lucide-react";

interface SiteStatistic {
  key: string;
  value: string;
  label: string;
  category: string;
  format_type: string;
}

const categoryIcons = {
  statistics: TrendingUp,
  investment: IndianRupee,
  content: Building,
};

const categoryLabels = {
  statistics: "Platform Statistics",
  investment: "Investment Settings", 
  content: "Content Values",
};

export default function SimpleStatisticsTab() {
  const { toast } = useToast();
  const [statistics, setStatistics] = useState<SiteStatistic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("statistics");

  // Direct fetch without React Query
  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Direct fetch of statistics starting...');
      
      const response = await fetch('/api/site-statistics', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Raw response data:', data);
      console.log('📊 Data type:', typeof data, 'Is array:', Array.isArray(data));
      console.log('📊 Data length:', data?.length || 0);

      setStatistics(Array.isArray(data) ? data : []);
      console.log('✅ Statistics loaded successfully:', data?.length || 0, 'items');
      
    } catch (err) {
      console.error('❌ Error fetching statistics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatistics([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load statistics on mount
  useEffect(() => {
    fetchStatistics();
  }, []);

  const handleInputChange = (key: string, value: string) => {
    setEditingValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async (statistic: SiteStatistic) => {
    try {
      const newValue = editingValues[statistic.key] || statistic.value;
      const currentTab = statistic.category; // Remember which tab we're on
      
      const response = await fetch(`/api/admin/site-statistics/${statistic.key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          value: newValue,
          label: statistic.label
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update statistic');
      }

      toast({
        title: "Success",
        description: "Statistic updated successfully",
      });
      
      setEditingValues({});
      await fetchStatistics(); // Refresh data
      setActiveTab(currentTab); // Stay on the same tab
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update statistic",
        variant: "destructive",
      });
    }
  };

  console.log('🎯 Component render state:', { 
    statisticsCount: statistics.length, 
    isLoading, 
    error, 
    hasValidArray: Array.isArray(statistics) 
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading statistics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-lg font-medium text-red-600">Error loading statistics</p>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchStatistics} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!Array.isArray(statistics) || statistics.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-lg font-medium">No statistics found</p>
          <p className="text-muted-foreground">Statistics will appear here once they are configured.</p>
          <p className="text-sm text-gray-500 mt-2">
            Debug: Got {statistics?.length || 0} items | Type: {typeof statistics}
          </p>
          <Button onClick={fetchStatistics} className="mt-4">
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  const groupedStatistics = statistics.reduce((acc: Record<string, SiteStatistic[]>, stat: SiteStatistic) => {
    if (!acc[stat.category]) {
      acc[stat.category] = [];
    }
    acc[stat.category].push(stat);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Site Statistics Management</h2>
          <p className="text-muted-foreground">
            Manage dynamic content and statistics displayed on the home page
          </p>
        </div>
        <Button onClick={fetchStatistics} variant="outline">
          Refresh Data
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          {Object.entries(groupedStatistics).map(([category]) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons] || TrendingUp;
            return (
              <TabsTrigger key={category} value={category} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {categoryLabels[category as keyof typeof categoryLabels] || category}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(groupedStatistics).map(([category, categoryStats]) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons] || Building;
          return (
            <TabsContent key={category} value={category} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {categoryLabels[category as keyof typeof categoryLabels] || category}
                  </CardTitle>
                  <CardDescription>
                    Update values that appear on the homepage and throughout the platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {categoryStats.map((stat) => (
                      <div key={stat.key} className="space-y-2">
                        <Label htmlFor={stat.key}>{stat.label}</Label>
                        <div className="flex gap-2">
                          <Input
                            id={stat.key}
                            value={editingValues[stat.key] ?? stat.value}
                            onChange={(e) => handleInputChange(stat.key, e.target.value)}
                            placeholder={`Enter ${stat.label.toLowerCase()}`}
                          />
                          <Button 
                            onClick={() => handleSave(stat)}
                            size="sm"
                            className="whitespace-nowrap"
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Key: {stat.key} • Type: {stat.format_type}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}