import { useState, useEffect, useMemo } from "react";

interface LivePreviewContentProps {
  sectionKey: string;
  content: string;
  renderPreview: (key: string) => React.ReactNode;
}

export default function LivePreviewContent({ sectionKey, content, renderPreview }: LivePreviewContentProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [content, sectionKey]);

  const previewContent = useMemo(() => {
    return renderPreview(sectionKey);
  }, [sectionKey, content, renderPreview, refreshKey]);

  return (
    <div key={`${sectionKey}-${refreshKey}-${content?.slice(0, 50)}`} className="w-full h-full">
      {previewContent}
    </div>
  );
}