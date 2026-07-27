import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export const apiService = {
  async health() {
    const response = await api.get('/health');
    return response.data;
  },
};

export function getApiBaseUrl() {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080/api';
  }

  return API_URL;
}
