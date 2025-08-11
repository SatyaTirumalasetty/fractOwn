import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, FileText, Settings } from "lucide-react";
import WYSIWYGHomeEditor from "./wysiwyg-home-editor";
import EnhancedContentManagement from "./enhanced-content-management";

export default function UnifiedContentManagement() {
  const [activeTab, setActiveTab] = useState("home-editor");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Website Content Management</h2>
          <p className="text-gray-600">Complete control over your website content with live preview</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="home-editor" className="flex items-center space-x-2">
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home Page</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Content Editor</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Advanced</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="home-editor">
          <WYSIWYGHomeEditor />
        </TabsContent>

        <TabsContent value="content">
          <EnhancedContentManagement />
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Content Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Advanced content management features will be available here.</p>
                <p className="text-sm">Including SEO settings, metadata, and bulk operations.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}