import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FeedName } from '../../models/feed-type';
import { fetchFeed } from '../../services/hackerNewsApi';
import { useAsyncResource } from '../../utils/useAsyncResource';
import { Item } from '../Item/Item';
import { Loader } from '../Loader/Loader';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import './Feed.scss';

interface FeedProps {
    feedType: FeedName;
}

const PAGE_SIZE = 30;

export function Feed({ feedType }: FeedProps) {
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? Number(page) : 1;
    const validPage = Number.isInteger(pageNum) && pageNum >= 1;
    const { data: items, error } = useAsyncResource(
        `${feedType}/${pageNum}`,
        validPage ? () => fetchFeed(feedType, pageNum) : null
    );
    const listStart = (pageNum - 1) * PAGE_SIZE + 1;

    useEffect(() => {
        if (items) window.scrollTo(0, 0);
    }, [items]);

    return (
        <div className="main-content feed">
            {!items && !error && <Loader />}
            {!items && error && <ErrorMessage message={`Could not load ${feedType} stories.`} />}

            {items && (
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
                        {items.length === PAGE_SIZE && (
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
