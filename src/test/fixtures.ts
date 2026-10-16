import type { Story } from '../models/story';
import type { Comment } from '../models/comment';
import type { User } from '../models/user';

export function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'A story',
        points: 42,
        user: 'pg',
        time: 0,
        time_ago: '2 hours ago',
        type: 'story',
        url: 'https://example.com/post',
        domain: 'example.com',
        comments: [],
        comments_count: 3,
        content: '',
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides,
    };
}

export function makeComment(overrides: Partial<Comment> = {}): Comment {
    return {
        id: 100,
        level: 0,
        user: 'alice',
        time: 0,
        time_ago: '1 hour ago',
        content: '<p>Top level comment</p>',
        deleted: false,
        comments: [],
        ...overrides,
    };
}

export function makeUser(overrides: Partial<User> = {}): User {
    return {
        id: 'pg',
        crated_time: 0,
        created: '18 years ago',
        karma: 157316,
        avg: 0,
        about: 'Bug fixer.',
        ...overrides,
    };
}

export function makeFeed(count: number, start = 1): Story[] {
    return Array.from({ length: count }, (_, i) => makeStory({ id: start + i, title: `Story ${start + i}` }));
}
