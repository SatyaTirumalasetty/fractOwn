import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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

export default function AdminStatisticsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});

  // Fetch site statistics with timeout handling
  const { data: statistics = [], isLoading, error } = useQuery<SiteStatistic[]>({
    queryKey: ["/api/site-statistics"],
    retry: 2,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
    gcTime: 300000, // 5 minutes
  });

  console.log('AdminStatisticsTab render:', { 
    statisticsCount: statistics?.length || 0, 
    isLoading, 
    error: error?.message || 'none', 
    hasData: !!statistics && statistics.length > 0 
  });

  // Update statistic mutation
  const updateStatisticMutation = useMutation({
    mutationFn: async ({ key, value, label }: { key: string; value: string; label: string }) => {
      return apiRequest(`/api/admin/site-statistics/${key}`, "PUT", { value, label });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-statistics"] });
      toast({
        title: "Success",
        description: "Statistic updated successfully",
      });
      setEditingValues({});
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update statistic",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (key: string, value: string) => {
    setEditingValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = (statistic: SiteStatistic) => {
    const newValue = editingValues[statistic.key] || statistic.value;
    updateStatisticMutation.mutate({
      key: statistic.key,
      value: newValue,
      label: statistic.label,
    });
  };

  const handleSaveAll = (category: string) => {
    const categoryStats = statistics.filter((stat: SiteStatistic) => stat.category === category);
    categoryStats.forEach((stat: SiteStatistic) => {
      const newValue = editingValues[stat.key];
      if (newValue && newValue !== stat.value) {
        updateStatisticMutation.mutate({
          key: stat.key,
          value: newValue,
          label: stat.label,
        });
      }
    });
  };

  const groupedStatistics = (statistics as SiteStatistic[]).reduce((acc: Record<string, SiteStatistic[]>, stat: SiteStatistic) => {
    if (!acc[stat.category]) {
      acc[stat.category] = [];
    }
    acc[stat.category].push(stat);
    return acc;
  }, {});

  console.log('Grouped statistics:', groupedStatistics);

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
          <p className="text-muted-foreground">{error.message || 'Failed to load statistics'}</p>
        </div>
      </div>
    );
  }

  if (!statistics || statistics.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-lg font-medium">No statistics found</p>
          <p className="text-muted-foreground">Statistics will appear here once they are configured.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Site Statistics Management</h2>
          <p className="text-muted-foreground">
            Manage dynamic content and statistics displayed on the home page
          </p>
        </div>
      </div>

      <Tabs defaultValue="statistics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          {Object.entries(groupedStatistics).length > 0 ? Object.entries(groupedStatistics).map(([category]) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons] || TrendingUp;
            return (
              <TabsTrigger key={category} value={category} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {categoryLabels[category as keyof typeof categoryLabels] || category}
              </TabsTrigger>
            );
          }) : (
            <TabsTrigger value="loading" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Loading...
            </TabsTrigger>
          )}
        </TabsList>

        {Object.entries(groupedStatistics).map(([category, stats]) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons] || TrendingUp;
          const hasChanges = (stats as SiteStatistic[]).some((stat: SiteStatistic) => 
            editingValues[stat.key] && editingValues[stat.key] !== stat.value
          );

          return (
            <TabsContent key={category} value={category}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    <div>
                      <CardTitle>{categoryLabels[category as keyof typeof categoryLabels] || category}</CardTitle>
                      <CardDescription>
                        Update values that appear on the homepage and throughout the platform
                      </CardDescription>
                    </div>
                  </div>
                  {hasChanges && (
                    <Button 
                      onClick={() => handleSaveAll(category)}
                      disabled={updateStatisticMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      {updateStatisticMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save All Changes
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(stats as SiteStatistic[]).map((stat: SiteStatistic) => {
                      const currentValue = editingValues[stat.key] ?? stat.value;
                      const hasChanged = editingValues[stat.key] && editingValues[stat.key] !== stat.value;

                      return (
                        <div key={stat.key} className="space-y-3">
                          <Label htmlFor={stat.key} className="text-sm font-medium">
                            {stat.label}
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id={stat.key}
                              value={currentValue}
                              onChange={(e) => handleInputChange(stat.key, e.target.value)}
                              placeholder={`Enter ${stat.label.toLowerCase()}`}
                              className={hasChanged ? "border-orange-500" : ""}
                            />
                            {hasChanged && (
                              <Button
                                size="sm"
                                onClick={() => handleSave(stat)}
                                disabled={updateStatisticMutation.isPending}
                                className="flex items-center gap-1"
                              >
                                {updateStatisticMutation.isPending ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Save className="h-3 w-3" />
                                )}
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Key: {stat.key} • Type: {stat.format_type}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Real-time Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            Changes made here will immediately reflect on the homepage and throughout the platform. 
            Users will see updated statistics without needing to refresh their browser.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}