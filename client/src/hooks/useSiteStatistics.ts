import { useQuery } from "@tanstack/react-query";

interface SiteStatistic {
  key: string;
  value: string;
  label: string;
  category: string;
  format_type: string;
}

export function useSiteStatistics() {
  const { data: statistics = [], isLoading, error } = useQuery<SiteStatistic[]>({
    queryKey: ["/api/site-statistics"],
    staleTime: 0, // Always fresh data
    refetchOnWindowFocus: true,
    gcTime: 0, // No caching
    refetchOnMount: 'always',
  });

  // Transform statistics into an easy-to-use object
  const stats = statistics.reduce((acc, stat) => {
    acc[stat.key] = stat.value;
    return acc;
  }, {} as Record<string, string>);

  // Helper functions to get specific statistics
  const getStatByKey = (key: string, fallback: string = '') => {
    return stats[key] || fallback;
  };

  const getStatsByCategory = (category: string) => {
    return statistics.filter(stat => stat.category === category);
  };

  return {
    statistics,
    stats,
    getStatByKey,
    getStatsByCategory,
    isLoading,
    error,
    // Specific statistics for easy access
    aumValue: getStatByKey('aum_value', '₹50 Cr+'),
    investorsCount: getStatByKey('investors_count', '20+'),
    propertiesCount: getStatByKey('properties_count', '10+'),
    citiesCount: getStatByKey('cities_count', '4'),
    minInvestment: getStatByKey('min_investment', '₹10 Lakh'),
    testimonialAmount: getStatByKey('testimonial_amount', '₹10 Lakh'),
    entryBarrier: getStatByKey('entry_barrier', '₹10 Lakh'),
    investStepAmount: getStatByKey('invest_step_amount', '₹10 Lakh'),
  };
}