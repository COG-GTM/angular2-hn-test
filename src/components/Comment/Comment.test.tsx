import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CommentItem } from './Comment';
import { renderWithProviders } from '../../test/utils';
import { makeComment } from '../../test/fixtures';

const tree = makeComment({
    comments: [
        makeComment({
            id: 101,
            user: 'bob',
            content: '<p>Reply</p>',
            comments: [makeComment({ id: 102, user: 'carol', content: '<p>Nested reply</p>' })],
        }),
    ],
});

describe('CommentItem', () => {
    it('renders the comment tree recursively', () => {
        renderWithProviders(<CommentItem comment={tree} />);
        expect(screen.getByText('Top level comment')).toBeInTheDocument();
        expect(screen.getByText('Reply')).toBeInTheDocument();
        expect(screen.getByText('Nested reply')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'carol' })).toHaveAttribute('href', '/user/carol');
    });

    it('collapses and expands a subtree by click and keyboard', async () => {
        const user = userEvent.setup();
        renderWithProviders(<CommentItem comment={tree} />);
        const [toggle] = screen.getAllByRole('button', { name: 'Collapse comment' });

        await user.click(toggle);
        expect(toggle).toHaveTextContent('[+]');
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        expect(screen.getByText('Nested reply')).not.toBeVisible();

        toggle.focus();
        await user.keyboard('{Enter}');
        expect(toggle).toHaveTextContent('[-]');
        expect(screen.getByText('Nested reply')).toBeVisible();
    });

    it('renders deleted comments', () => {
        renderWithProviders(<CommentItem comment={makeComment({ deleted: true })} />);
        expect(screen.getByText('[deleted]')).toBeInTheDocument();
        expect(screen.queryByText('Top level comment')).not.toBeInTheDocument();
    });

    it('sanitizes comment HTML', () => {
        const { container } = renderWithProviders(
            <CommentItem comment={makeComment({ content: '<img src=x onerror="alert(1)">safe' })} />
        );
        expect(container.querySelector('img')).toBeNull();
        expect(screen.getByText('safe')).toBeInTheDocument();
    });
});
