import { ApiClient } from '../../../lib/services/apiClient';

// Mock fetch globally
global.fetch = jest.fn();

describe('ApiClient', () => {
  let apiClient: ApiClient;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    apiClient = new ApiClient();
    mockFetch.mockClear();
  });

  afterEach(() => {
    apiClient.clearCache();
  });

  describe('GET requests', () => {
    it('makes successful GET request', async () => {
      const mockData = { message: 'success' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      } as Response);

      const result = await apiClient.get('/test');

      expect(mockFetch).toHaveBeenCalledWith('/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });

    it('handles GET request errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Not found' }),
      } as Response);

      const result = await apiClient.get('/test');

      expect(result.success).toBe(false);
      expect(result.error).toContain('404');
    });

    it('caches GET requests', async () => {
      const mockData = { message: 'cached' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      } as Response);

      // First request
      const result1 = await apiClient.get('/test');
      expect(result1.cached).toBeFalsy();

      // Second request should be cached
      const result2 = await apiClient.get('/test');
      expect(result2.cached).toBe(true);
      expect(result2.data).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('respects cache TTL', async () => {
      jest.useFakeTimers();
      
      const mockData = { message: 'ttl test' };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      } as Response);

      // First request
      await apiClient.get('/test', { cacheTTL: 1000 });
      
      // Fast-forward past TTL
      jest.advanceTimersByTime(1001);
      
      // Second request should not be cached
      const result = await apiClient.get('/test', { cacheTTL: 1000 });
      expect(result.cached).toBeFalsy();
      expect(mockFetch).toHaveBeenCalledTimes(2);
      
      jest.useRealTimers();
    });
  });

  describe('POST requests', () => {
    it('makes successful POST request with data', async () => {
      const requestData = { name: 'test' };
      const responseData = { id: 1, name: 'test' };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => responseData,
      } as Response);

      const result = await apiClient.post('/test', requestData);

      expect(mockFetch).toHaveBeenCalledWith('/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(responseData);
    });

    it('handles POST request errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Invalid data' }),
      } as Response);

      const result = await apiClient.post('/test', {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('400');
    });
  });

  describe('PUT requests', () => {
    it('makes successful PUT request', async () => {
      const requestData = { id: 1, name: 'updated' };
      const responseData = { id: 1, name: 'updated', updatedAt: '2023-01-01' };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => responseData,
      } as Response);

      const result = await apiClient.put('/test/1', requestData);

      expect(mockFetch).toHaveBeenCalledWith('/test/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(responseData);
    });
  });

  describe('DELETE requests', () => {
    it('makes successful DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: async () => ({}),
      } as Response);

      const result = await apiClient.delete('/test/1');

      expect(mockFetch).toHaveBeenCalledWith('/test/1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Retry logic', () => {
    it('retries failed requests', async () => {
      // First two calls fail, third succeeds
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true }),
        } as Response);

      const result = await apiClient.get('/test', { 
        retries: { maxRetries: 3, baseDelay: 100, maxDelay: 1000 } 
      });

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result.success).toBe(true);
    });

    it('gives up after max retries', async () => {
      mockFetch.mockRejectedValue(new Error('Persistent error'));

      const result = await apiClient.get('/test', { 
        retries: { maxRetries: 2, baseDelay: 100, maxDelay: 1000 } 
      });

      expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
      expect(result.success).toBe(false);
      expect(result.error).toContain('Persistent error');
    });

    it('implements exponential backoff', async () => {
      jest.useFakeTimers();
      
      mockFetch
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true }),
        } as Response);

      const requestPromise = apiClient.get('/test', { 
        retries: { maxRetries: 2, baseDelay: 100, maxDelay: 1000 } 
      });

      // Fast-forward through retry delays
      jest.advanceTimersByTime(100); // First retry delay
      jest.advanceTimersByTime(200); // Second retry delay (exponential)

      const result = await requestPromise;
      expect(result.success).toBe(true);
      
      jest.useRealTimers();
    });
  });

  describe('Request timeout', () => {
    it('times out long requests', async () => {
      mockFetch.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 10000))
      );

      const result = await apiClient.get('/test', { timeout: 1000 });

      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });
  });

  describe('Custom headers', () => {
    it('includes custom headers in requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      } as Response);

      await apiClient.get('/test', { 
        headers: { 'Authorization': 'Bearer token123' } 
      });

      expect(mockFetch).toHaveBeenCalledWith('/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token123',
        },
      });
    });
  });

  describe('Cache management', () => {
    it('clears cache', async () => {
      const mockData = { message: 'test' };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      } as Response);

      // Make cached request
      await apiClient.get('/test');
      
      // Clear cache
      apiClient.clearCache();
      
      // Next request should not be cached
      const result = await apiClient.get('/test');
      expect(result.cached).toBeFalsy();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('deletes specific cache entries', async () => {
      const mockData = { message: 'test' };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      } as Response);

      // Make multiple cached requests
      await apiClient.get('/test1');
      await apiClient.get('/test2');
      
      // Delete specific cache entry
      apiClient.deleteFromCache('/test1');
      
      // test1 should not be cached, test2 should be
      const result1 = await apiClient.get('/test1');
      const result2 = await apiClient.get('/test2');
      
      expect(result1.cached).toBeFalsy();
      expect(result2.cached).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await apiClient.get('/test');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('handles JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => { throw new Error('Invalid JSON'); },
      } as Response);

      const result = await apiClient.get('/test');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid JSON');
    });

    it('handles HTTP error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Server error' }),
      } as Response);

      const result = await apiClient.get('/test');

      expect(result.success).toBe(false);
      expect(result.error).toContain('500');
    });
  });
});