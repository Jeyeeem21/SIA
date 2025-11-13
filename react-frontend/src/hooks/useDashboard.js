import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

// Fetch dashboard data - REALTIME updates every second from global config
export const useDashboard = () => {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/dashboard`);
      return response.data;
    },
    // Uses global config: refetchInterval: 1000 (REALTIME EVERY SECOND!)
    // staleTime: 0, refetchOnMount: 'always' - instant from cache + 1s background updates!
  });
};
