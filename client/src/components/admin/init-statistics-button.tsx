import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Database } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function InitStatisticsButton() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const initMutation = useMutation({
    mutationFn: () => apiRequest("/api/admin/initialize-statistics", "POST", {}),
    onSuccess: (data: any) => {
      toast({
        title: "Statistics Initialized",
        description: data.message,
        variant: "default"
      });
      // Refresh the statistics data
      queryClient.invalidateQueries({ queryKey: ["/api/site-statistics"] });
    },
    onError: (error: any) => {
      toast({
        title: "Initialization Failed",
        description: error.message || "Failed to initialize statistics",
        variant: "destructive"
      });
    }
  });

  return (
    <Button
      onClick={() => initMutation.mutate()}
      disabled={initMutation.isPending}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      {initMutation.isPending ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Database className="h-4 w-4" />
      )}
      {initMutation.isPending ? "Initializing..." : "Initialize Statistics"}
    </Button>
  );
}