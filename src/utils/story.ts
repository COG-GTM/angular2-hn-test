import { Story } from '../models/story';

export function hasExternalUrl(item: Pick<Story, 'url'>): boolean {
    return !!item.url && item.url.indexOf('http') === 0;
}

export function pollBarWidth(points: number, totalVotes: number): string {
    return totalVotes > 0 ? `${(points / totalVotes) * 100}%` : '0%';
}
