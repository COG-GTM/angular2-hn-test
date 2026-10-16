import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FeedName } from '../../models/feed-type';
import { fetchFeed } from '../../services/hackerNewsApi';
import { parsePositiveInt } from '../../utils/story';
import { useAsyncResource } from '../../utils/useAsyncResource';
import { Item } from '../Item/Item';
import { Loader } from '../Loader/Loader';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import './Feed.scss';

export const FEED_PAGE_SIZE = 30;

interface FeedProps {
    feedType: FeedName;
}

export function Feed({ feedType }: FeedProps) {
    const { page } = useParams<{ page: string }>();
    const pageNum = page === undefined ? 1 : parsePositiveInt(page);
    const { data: items, error } = useAsyncResource(
        `${feedType}/${page}`,
        pageNum === null ? null : () => fetchFeed(feedType, pageNum)
    );
    const listStart = ((pageNum ?? 1) - 1) * FEED_PAGE_SIZE + 1;

    // Angular scrolled to the top once the page loaded; also do it when the page changes so the
    // loader is visible instead of a blank screen when More/Back is used from the bottom.
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [feedType, page]);

    useEffect(() => {
        if (items) window.scrollTo(0, 0);
    }, [items]);

    return (
        <div className="main-content feed">
            {!items && !error && <Loader />}
            {!items && error && <ErrorMessage message={`Could not load ${feedType} stories.`} />}

            {items && pageNum !== null && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator. You can also get a job at a
                            YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                        {items.map((item) => (
                            <li key={item.id} className="post">
                                <Item item={item} />
                            </li>
                        ))}
                    </ol>
                    <div className="nav">
                        {listStart !== 1 && (
                            <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                                ‹ Prev
                            </Link>
                        )}
                        {listStart !== 1 && items.length === FEED_PAGE_SIZE && ' '}
                        {items.length === FEED_PAGE_SIZE && (
                            <Link to={`/${feedType}/${pageNum + 1}`} className="more">
                                More ›
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
