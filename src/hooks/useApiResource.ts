'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Thin async loader matching the appointments list pattern (useEffect + state).
 * Facades in `@/lib/api/services` already branch on USE_API_MOCK.
 */
export function useApiResource<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await loader());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls deps explicitly
  }, deps);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, setData, loading, error, refresh };
}

/** List variant — starts as empty array instead of null. */
export function useApiList<T>(loader: () => Promise<T[]>, deps: unknown[] = []) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await loader());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, setData, loading, error, refresh };
}
