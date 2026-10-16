import { useEffect, useState } from 'react';

interface ResourceState<T> {
    key: string;
    data: T | null;
    error: boolean;
}

/**
 * Loads data for `key`, returning `null` data until the request for the *current*
 * key resolves, so a previous route's result is never rendered as current.
 */
export function useAsyncResource<T>(key: string, load: (() => Promise<T>) | null) {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    if (!load) return { data: null, error: true };
    const current = state.key === key;
    return { data: current ? state.data : null, error: current && state.error };
}
