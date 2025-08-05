import { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";

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
      
      return response.json();
    },
  });

  const login = (userData: User, token: string) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('sessionToken', token);
    setSessionToken(token);
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
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('user');
      setSessionToken(null);
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