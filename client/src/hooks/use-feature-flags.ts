import { useQuery } from '@tanstack/react-query';

interface FeatureFlags {
  enableUserRegistration: boolean;
  enableEmailNotifications: boolean;
  enableSMSNotifications: boolean;
  enablePaymentIntegration: boolean;
}

export function useFeatureFlags() {
  const { data: features, isLoading } = useQuery<FeatureFlags>({
    queryKey: ['/api/config/features'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    features: features || {
      enableUserRegistration: false,
      enableEmailNotifications: false,
      enableSMSNotifications: false,
      enablePaymentIntegration: false,
    },
    isLoading,
  };
}