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

    it('returns the error state for a null loader or a rejection', async () => {
        const { result: invalid } = renderHook(() => useAsyncResource('x', null));
        expect(invalid.current).toEqual({ data: null, error: true, loading: false });

        const { result } = renderHook(() => useAsyncResource('y', () => Promise.reject(new Error('no'))));
        await waitFor(() => expect(result.current.error).toBe(true));
    });
});
