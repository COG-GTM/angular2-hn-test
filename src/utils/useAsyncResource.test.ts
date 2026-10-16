import { describe, expect, it } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useAsyncResource } from './useAsyncResource';

function deferred<T>() {
    let resolve!: (v: T) => void;
    const promise = new Promise<T>((r) => (resolve = r));
    return { promise, resolve };
}

describe('useAsyncResource', () => {
    it('never returns the previous key data and ignores late responses', async () => {
        const a = deferred<string>();
        const b = deferred<string>();
        const loaders: Record<string, Promise<string>> = { a: a.promise, b: b.promise };
        const { result, rerender } = renderHook(({ k }) => useAsyncResource(k, () => loaders[k]), {
            initialProps: { k: 'a' },
        });
        expect(result.current).toEqual({ data: null, error: false, loading: true });

        rerender({ k: 'b' });
        await act(async () => a.resolve('A'));
        expect(result.current.data).toBeNull();

        await act(async () => b.resolve('B'));
        await waitFor(() => expect(result.current.data).toBe('B'));
    });

    it('shows the loader when a previous key returns before its fresh request settles', async () => {
        const pending = deferred<string>();
        let calls = 0;
        const { result, rerender } = renderHook(
            ({ k }) =>
                useAsyncResource(k, () => (k === 'a' && calls++ === 0 ? Promise.resolve('A1') : pending.promise)),
            { initialProps: { k: 'a' } }
        );
        await waitFor(() => expect(result.current.data).toBe('A1'));
        rerender({ k: 'b' });
        rerender({ k: 'a' });
        expect(result.current).toEqual({ data: null, error: false, loading: true });
        await act(async () => pending.resolve('A2'));
        await waitFor(() => expect(result.current.data).toBe('A2'));
    });

    it('finishes loading for falsy results', async () => {
        const { result } = renderHook(() => useAsyncResource('zero', () => Promise.resolve(0)));
        await waitFor(() => expect(result.current).toEqual({ data: 0, error: false, loading: false }));
    });

    it('starts the request when a loader appears for the same key', async () => {
        const { result, rerender } = renderHook(
            ({ ready }) => useAsyncResource('k', ready ? () => Promise.resolve('ok') : null),
            {
                initialProps: { ready: false },
            }
        );
        expect(result.current.error).toBe(true);
        rerender({ ready: true });
        await waitFor(() => expect(result.current).toEqual({ data: 'ok', error: false, loading: false }));
    });

    it('returns the error state for a null loader or a rejection', async () => {
        const { result: invalid } = renderHook(() => useAsyncResource('x', null));
        expect(invalid.current).toEqual({ data: null, error: true, loading: false });

        const { result } = renderHook(() => useAsyncResource('y', () => Promise.reject(new Error('no'))));
        await waitFor(() => expect(result.current.error).toBe(true));
    });
});
