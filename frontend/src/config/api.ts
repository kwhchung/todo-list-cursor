// API Configuration
const API_HOST = process.env.REACT_APP_API_HOST || 'http://localhost:8080';

export const API_BASE_URL = `${API_HOST}/api`;

// API endpoints
export const API_ENDPOINTS = {
  TASKS: `${API_BASE_URL}/tasks`,
  TAGS: `${API_BASE_URL}/tags`,
  TABS: `${API_BASE_URL}/tabs`,
} as const;

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};