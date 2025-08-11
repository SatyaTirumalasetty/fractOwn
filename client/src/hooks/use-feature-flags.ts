import { useQuery } from "@tanstack/react-query";

export function useFeatureFlags() {
  const { data: features } = useQuery({
    queryKey: ['/api/config/features'],
    queryFn: async () => {
      const response = await fetch('/api/config/features');
      if (!response.ok) {
        return {
          enableUserRegistration: false,
          enableEmailNotifications: false,
          enableSMSNotifications: false,
          enablePaymentIntegration: false
        };
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    features: features || {
      enableUserRegistration: false,
      enableEmailNotifications: false,
      enableSMSNotifications: false,
      enablePaymentIntegration: false
    }
  };
}