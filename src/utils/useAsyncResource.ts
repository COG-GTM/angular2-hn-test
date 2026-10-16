import { useEffect, useState } from 'react';

interface ResourceState<T> {
    key: string;
    data: T | null;
    error: boolean;
    done: boolean;
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
    const [state, setState] = useState<ResourceState<T>>({ key: '', data: null, error: false, done: false });

    useEffect(() => {
        if (!load) return;
        let cancelled = false;
        load().then(
            (data) => {
                if (!cancelled) setState({ key, data, error: false, done: true });
            },
            () => {
                if (!cancelled) setState({ key, data: null, error: true, done: true });
            }
        );
        return () => {
            cancelled = true;
        };
        // `load` is recreated every render; `key` identifies the request, and a
        // null -> loader transition for the same key must still start it.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, load === null]);

    if (!load) return { data: null, error: true, loading: false };
    const current = state.key === key && state.done;
    return { data: current ? state.data : null, error: current && state.error, loading: !current };
}
