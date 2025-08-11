import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Plus, Trash2, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Statistic {
  value: string;
  label: string;
}

interface StatisticsManagerProps {
  initialStats?: Statistic[];
  onSave?: (stats: Statistic[]) => void;
}

export default function StatisticsManager({ initialStats = [], onSave }: StatisticsManagerProps) {
  const [stats, setStats] = useState<Statistic[]>(initialStats);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialStats.length === 0) {
      setStats([
        { value: "₹500\u00A0Cr+", label: "Assets Under Management" },
        { value: "15,000+", label: "Happy Investors" },
        { value: "50\u00A0Cr+", label: "Properties Listed" },
        { value: "8\u00A0Cities", label: "Across India" }
      ]);
    } else {
      setStats(initialStats);
    }
  }, [initialStats]);

  const updateStat = (index: number, field: 'value' | 'label', newValue: string) => {
    setStats(prev => prev.map((stat, i) => 
      i === index ? { ...stat, [field]: newValue } : stat
    ));
  };

  const addStat = () => {
    setStats(prev => [...prev, { value: "", label: "" }]);
  };

  const removeStat = (index: number) => {
    setStats(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (stats.some(stat => !stat.value.trim() || !stat.label.trim())) {
      toast({
        title: "Validation Error",
        description: "All statistics must have both value and label.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      // Convert stats to content format
      const content = stats.map(stat => `• ${stat.value}: ${stat.label}`).join('\n');
      
      const response = await fetch('/api/admin/content/home_content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error('Failed to save statistics');
      }

      queryClient.invalidateQueries({ queryKey: ['/api/content'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content/'] });

      if (onSave) {
        onSave(stats);
      }

      toast({
        title: "Statistics Updated",
        description: "Statistics have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save statistics. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatValue = (value: string): string => {
    // Automatically add non-breaking spaces between numbers and units
    return value
      .replace(/(\d+)\s+(Cr\+?)/g, '$1\u00A0$2')
      .replace(/(\d+)\s+(Cities)/g, '$1\u00A0$2')
      .replace(/₹\s*(\d)/g, '₹$1');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <span>Statistics Manager</span>
        </CardTitle>
        <CardDescription>
          Manage the statistics displayed on your home page. Format will be preserved automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {stats.map((stat, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
              <div>
                <Label htmlFor={`value-${index}`} className="text-sm font-medium">
                  Value (e.g., ₹500 Cr+, 15,000+)
                </Label>
                <Input
                  id={`value-${index}`}
                  value={stat.value}
                  onChange={(e) => updateStat(index, 'value', formatValue(e.target.value))}
                  placeholder="e.g., ₹500 Cr+"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor={`label-${index}`} className="text-sm font-medium">
                  Label
                </Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id={`label-${index}`}
                    value={stat.label}
                    onChange={(e) => updateStat(index, 'label', e.target.value)}
                    placeholder="e.g., Assets Under Management"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeStat(index)}
                    disabled={stats.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" onClick={addStat}>
            <Plus className="w-4 h-4 mr-2" />
            Add Statistic
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Statistics"}
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Formatting Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use "Cr+" for crores (e.g., ₹500 Cr+)</li>
            <li>• Add "+" for ranges (e.g., 15,000+)</li>
            <li>• Spaces will be automatically converted to non-breaking spaces</li>
            <li>• Currency symbols will be properly formatted</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}