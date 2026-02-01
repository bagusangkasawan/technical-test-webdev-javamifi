// Custom Hooks - Hook untuk auth, modal, toast, dan API fetching
import { useState, useEffect, useCallback } from 'react';

// Generic hook for API data fetching
export function useApi<T>(
  fetcher: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    fetchData();
  }, [...dependencies, fetchData]);

  return { data, loading, error, refetch: fetchData, setData };
}

// Auth hook
export function useAuth() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('erp_token')
  );
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (token && !user) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ name: payload.name, role: payload.role, _id: payload._id });
      } catch {
        handleLogout();
      }
    }
  }, [token, user]);

  const handleLogin = (newToken: string, userData: any) => {
    localStorage.setItem('erp_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('erp_token');
    setToken(null);
    setUser(null);
  };

  return {
    token,
    user,
    isAuthenticated: !!token,
    login: handleLogin,
    logout: handleLogout,
  };
}

// Modal hook
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
}

// Toast/Notification hook
export function useToast() {
  const [toasts, setToasts] = useState<
    Array<{ id: number; message: string; type: 'success' | 'error' | 'info' }>
  >([]);

  const addToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

// Debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
