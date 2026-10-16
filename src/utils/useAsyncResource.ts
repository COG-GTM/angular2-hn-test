import { useEffect, useState } from 'react';

interface ResourceState<T> {
    key: string;
    data: T | null;
    error: boolean;
}

export interface AsyncResource<T> {
    data: T | null;
    error: boolean;
    loading: boolean;
}

/**
 * Loads data for `key` (e.g. `news/2`, `item/123`). Results are tagged with the key that
 * requested them, so a previous route's data is never rendered as current and late
 * responses from abandoned keys are ignored. Pass `load = null` for an invalid param to
 * get the error state instead of a loader that never resolves.
 */
export function useAsyncResource<T>(key: string, load: (() => Promise<T>) | null): AsyncResource<T> {
    const [state, setState] = useState<ResourceState<T>>({ key: '', data: null, error: false });

    useEffect(() => {
        if (!load) return;
        let cancelled = false;
        load().then(
            (data) => {
                if (!cancelled) setState({ key, data, error: false });
            },
            () => {
                if (!cancelled) setState({ key, data: null, error: true });
            }
        );
        return () => {
            cancelled = true;
        };
        // `load` is recreated every render; `key` identifies the request.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    if (!load) return { data: null, error: true, loading: false };
    const current = state.key === key;
    const data = current ? state.data : null;
    const error = current && state.error;
    return { data, error, loading: !data && !error };
}
