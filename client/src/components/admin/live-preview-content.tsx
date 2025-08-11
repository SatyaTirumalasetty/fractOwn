import { useState, useEffect } from "react";

interface LivePreviewContentProps {
  sectionKey: string;
  content: string;
  renderPreview: (key: string) => React.ReactNode;
}

export default function LivePreviewContent({ sectionKey, content, renderPreview }: LivePreviewContentProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [content]);

  return (
    <div key={`${sectionKey}-${refreshKey}`} className="w-full h-full">
      {renderPreview(sectionKey)}
    </div>
  );
}