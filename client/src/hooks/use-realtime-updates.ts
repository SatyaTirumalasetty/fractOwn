import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimeUpdates() {
  const queryClient = useQueryClient();

  const connectWebSocket = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('Real-time updates connected');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'PROPERTY_UPDATED':
        case 'PROPERTY_CREATED':
        case 'PROPERTY_DELETED':
          // Invalidate properties cache to trigger refresh
          queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
          queryClient.invalidateQueries({ queryKey: ['/api/admin/properties'] });
          break;
          
        case 'SETTINGS_UPDATED':
          // Invalidate any settings-related queries
          queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
          // Force a page refresh for theme/branding changes
          window.location.reload();
          break;
          
        case 'CONTACT_CREATED':
          queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
          break;
      }
    };

    socket.onclose = () => {
      console.log('Real-time updates disconnected, attempting to reconnect...');
      // Attempt to reconnect after 3 seconds
      setTimeout(connectWebSocket, 3000);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return socket;
  }, [queryClient]);

  useEffect(() => {
    const socket = connectWebSocket();
    
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [connectWebSocket]);
}