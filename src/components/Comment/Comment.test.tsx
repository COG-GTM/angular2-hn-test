import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentItem } from './Comment';
import { renderWithProviders } from '../../test/utils';
import { makeComment } from '../../test/fixtures';

function deepThread() {
    return makeComment({
        id: 1,
        user: 'level0',
        content: '<p>level 0 text</p>',
        comments: [
            makeComment({
                id: 2,
                user: 'level1',
                content: '<p>level 1 text</p>',
                comments: [
                    makeComment({
                        id: 3,
                        user: 'level2',
                        content: '<p>level 2 text</p>',
                        comments: [makeComment({ id: 4, user: 'level3', content: '<p>level 3 text</p>' })],
                    }),
                ],
            }),
            makeComment({ id: 5, user: 'sibling', content: '<p>sibling text</p>' }),
        ],
    });
}

describe('CommentItem', () => {
    it('renders nested replies recursively inside ul.subtree > li', () => {
        const { container } = renderWithProviders(<CommentItem comment={deepThread()} />);
        for (const level of [0, 1, 2, 3]) {
            expect(screen.getByText(`level ${level} text`)).toBeInTheDocument();
            expect(screen.getByRole('link', { name: `level${level}` })).toHaveAttribute('href', `/user/level${level}`);
        }
        expect(container.querySelectorAll('ul.subtree > li > .comment')).toHaveLength(4);
        expect(container.querySelector('ul.subtree ul.subtree ul.subtree')).toHaveTextContent('level 3 text');
    });

    it('shows user, time_ago and the [-] toggle', () => {
        renderWithProviders(<CommentItem comment={makeComment({ user: 'alice', time_ago: '5 minutes ago' })} />);
        expect(screen.getByText('5 minutes ago')).toHaveClass('time');
        const toggle = screen.getByRole('button', { name: 'Collapse comment by alice' });
        expect(toggle.tagName).toBe('SPAN');
        expect(toggle).toHaveClass('collapse');
        expect(toggle).toHaveTextContent('[-]');
        expect(toggle).toHaveAttribute('aria-expanded', 'true');
    });

    it('collapse hides the text and whole subtree, and re-expands with nested state intact', async () => {
        const user = userEvent.setup();
        const { container } = renderWithProviders(<CommentItem comment={deepThread()} />);

        // Collapse a nested comment first.
        await user.click(screen.getByRole('button', { name: 'Collapse comment by level2' }));
        expect(screen.getByText('level 2 text')).not.toBeVisible();
        expect(screen.getByText('level 3 text')).not.toBeVisible();
        expect(screen.getByText('level 1 text')).toBeVisible();

        // Collapse the root: everything below it is hidden.
        const root = screen.getByRole('button', { name: 'Collapse comment by level0' });
        await user.click(root);
        expect(root).toHaveTextContent('[+]');
        expect(root).toHaveAttribute('aria-expanded', 'false');
        expect(root.parentElement).toHaveClass('meta', 'meta-collapse');
        for (const text of ['level 0 text', 'level 1 text', 'sibling text']) {
            expect(screen.getByText(text)).not.toBeVisible();
        }
        // The root's meta row stays visible.
        expect(screen.getByRole('link', { name: 'level0' })).toBeVisible();

        // Re-expand: the nested comment is still collapsed (state survived).
        await user.click(screen.getByRole('button', { name: 'Expand comment by level0' }));
        expect(screen.getByText('level 0 text')).toBeVisible();
        expect(screen.getByText('level 1 text')).toBeVisible();
        expect(screen.getByText('sibling text')).toBeVisible();
        expect(screen.getByText('level 2 text')).not.toBeVisible();
        const nested = screen.getByRole('button', { name: 'Expand comment by level2' });
        expect(nested).toHaveTextContent('[+]');
        expect(container.querySelectorAll('.meta-collapse')).toHaveLength(1);
    });

    it('toggles from the keyboard (Enter and Space)', async () => {
        const user = userEvent.setup();
        renderWithProviders(<CommentItem comment={makeComment({ user: 'kb', content: '<p>keyboard text</p>' })} />);
        const toggle = screen.getByRole('button', { name: 'Collapse comment by kb' });
        toggle.focus();
        await user.keyboard('{Enter}');
        expect(screen.getByText('keyboard text')).not.toBeVisible();
        await user.keyboard(' ');
        expect(screen.getByText('keyboard text')).toBeVisible();
    });

    it('renders deleted comments as [deleted] | Comment Deleted without user or toggle', () => {
        const { container } = renderWithProviders(
            <CommentItem comment={makeComment({ deleted: true, user: 'ghost', content: '<p>gone</p>' })} />
        );
        const meta = container.querySelector('.deleted-meta');
        expect(meta).toHaveTextContent('[deleted] | Comment Deleted');
        expect(within(meta as HTMLElement).getByText('[deleted]')).toHaveClass('collapse');
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        expect(screen.queryByText('ghost')).not.toBeInTheDocument();
        expect(screen.queryByText('gone')).not.toBeInTheDocument();
    });

    it('renders deleted replies inside a live thread', () => {
        renderWithProviders(
            <CommentItem comment={makeComment({ comments: [makeComment({ id: 7, deleted: true })] })} />
        );
        expect(screen.getByText('[deleted]')).toBeInTheDocument();
    });

    it('sanitizes comment HTML', () => {
        const { container } = renderWithProviders(
            <CommentItem
                comment={makeComment({
                    content:
                        '<p>safe <a href="https://example.com">link</a></p><script>window.pwned=1</script><img src=x onerror="alert(1)"><a href="javascript:alert(1)">bad</a>',
                })}
            />
        );
        const text = container.querySelector('.comment-text') as HTMLElement;
        expect(within(text).getByRole('link', { name: 'link' })).toHaveAttribute('href', 'https://example.com');
        expect(text.querySelector('script, img')).toBeNull();
        expect(within(text).getByText('bad')).not.toHaveAttribute('href');
        expect(text.innerHTML).not.toContain('onerror');
    });

    it('renders a deep, wide thread (12 levels, 300+ comments) with stable keys', () => {
        let id = 1000;
        const build = (depth: number): ReturnType<typeof makeComment> =>
            makeComment({
                id: id++,
                user: `u${id}`,
                content: `<p>c${id}</p>`,
                comments: depth === 0 ? [] : depth > 9 ? [build(depth - 1), build(depth - 1)] : [build(depth - 1)],
            });
        const roots = Array.from({ length: 40 }, () => build(12));
        const { container } = renderWithProviders(
            <ul>
                {roots.map((c) => (
                    <li key={c.id}>
                        <CommentItem comment={c} />
                    </li>
                ))}
            </ul>
        );
        expect(id - 1000).toBeGreaterThan(300);
        expect(container.querySelectorAll('.comment')).toHaveLength(id - 1000);
    });
});
