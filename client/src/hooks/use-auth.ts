import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface User {
  id: string;
  name: string;
  countryCode: string;
  phoneNumber: string;
  email?: string;
  isVerified: boolean;
  isActive: boolean;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [sessionToken, setSessionToken] = useState<string | null>(
    localStorage.getItem('sessionToken')
  );

  // Query current user if we have a session token
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    enabled: !!sessionToken,
    retry: false,
    queryFn: async () => {
      const response = await fetch('/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });
      
      if (!response.ok) {
        // Clear invalid session
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('user');
        setSessionToken(null);
        throw new Error('Session expired');
      }
      
      const data = await response.json();
      return data.user || data; // Handle both {user: ...} and direct user object formats
    },
  });

  const login = (userData: User, token: string) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('sessionToken', token);
    setSessionToken(token);
    
    // Invalidate queries to refresh user data
    queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
  };

  const logout = async () => {
    try {
      if (sessionToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all authentication data
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('user');
      setSessionToken(null);
      
      // Invalidate all queries to force refresh
      queryClient.invalidateQueries();
      queryClient.clear();
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading: isLoading && !!sessionToken,
    sessionToken,
    login,
    logout,
  };
}