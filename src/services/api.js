const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Production-Grade API Client with retry logic and better error handling
 */

class ApiError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'ApiError';
  }
}

/**
 * Retry logic for failed requests
 */
const retryRequest = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0 || error.statusCode < 500) {
      throw error;
    }
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryRequest(fn, retries - 1, delay * 2);
  }
};

/**
 * Generic fetch wrapper for API calls with timeout
 */
export const request = async (endpoint, options = {}) => {
  const { body, timeout = 30000, retry = true, ...customOptions } = options;
  
  const headers = {
    'Content-Type': 'application/json',
    ...customOptions.headers,
  };

  // Get token from session if available
  const sessionStr = localStorage.getItem('tradz_session');
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
        console.log('Added auth header with token:', session.access_token.substring(0, 20) + '...');
      } else {
        console.warn('Session exists but no access_token:', session);
      }
    } catch (e) {
      console.warn('Failed to parse session:', e);
    }
  } else {
    console.warn('No session found in localStorage');
  }

  const config = {
    ...customOptions,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const fetchWithTimeout = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        throw new ApiError(
          data.error || data.message || 'Something went wrong',
          response.status,
          data.code
        );
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, 'TIMEOUT');
      }
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        error.message || 'Network error',
        0,
        'NETWORK_ERROR'
      );
    }
  };

  if (retry) {
    return retryRequest(fetchWithTimeout);
  }
  
  return fetchWithTimeout();
};

/**
 * Convenience methods
 */
export const api = {
  get: (endpoint, options = {}) => 
    request(endpoint, { ...options, method: 'GET' }),
  
  post: (endpoint, body, options = {}) => 
    request(endpoint, { ...options, method: 'POST', body }),
  
  put: (endpoint, body, options = {}) => 
    request(endpoint, { ...options, method: 'PUT', body }),
  
  patch: (endpoint, body, options = {}) => 
    request(endpoint, { ...options, method: 'PATCH', body }),
  
  delete: (endpoint, options = {}) => 
    request(endpoint, { ...options, method: 'DELETE' }),
};
