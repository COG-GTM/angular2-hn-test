/** Poll bar width as a percentage of all votes; 0% when nobody has voted yet. */
export function pollBarWidth(points: number, totalVotes: number): string {
    if (!totalVotes || totalVotes <= 0) return '0%';
    return `${(points / totalVotes) * 100}%`;
}
