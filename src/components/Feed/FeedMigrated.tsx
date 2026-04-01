import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Story } from '../../models/story';
import { FeedName } from '../../models/feed-type';
import { fetchFeed } from '../../services/hackerNewsApi';
import './Feed.scss';

/**
 * FeedMigrated — React migration of the Angular FeedComponent.
 *
 * Angular original:
 *   - selector: 'app-feed'
 *   - Received `feedType` via ActivatedRoute.data
 *   - Received `page` via ActivatedRoute.params
 *   - Injected HackerNewsAPIService for data fetching
 *   - Used ngOnInit with RxJS subscriptions for data loading
 *
 * React migration:
 *   - `feedType` passed as a prop (replaces route data)
 *   - `page` extracted via useParams (replaces ActivatedRoute.params)
 *   - fetchFeed imported directly (replaces injected service)
 *   - useEffect replaces ngOnInit subscriptions
 *   - Cleanup via cancelled flag replaces Subscription unsubscribe
 */

interface FeedMigratedProps {
    feedType: FeedName;
}

export function FeedMigrated({ feedType }: FeedMigratedProps) {
    // State — mirrors Angular component properties
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? +page : 1;
    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [listStart, setListStart] = useState(1);

    // Replaces ngOnInit + RxJS subscriptions to route.data and route.params
    // In Angular, typeSub watched route.data for feedType, and pageSub watched
    // route.params for page number changes. Both triggered fetchFeed().
    // Here, useEffect watches [feedType, pageNum] to achieve the same behavior.
    useEffect(() => {
        let cancelled = false;

        // Reset state on navigation (mirrors Angular re-subscription behavior)
        setItems(null);
        setErrorMessage('');

        // Replaces: this._hackerNewsAPIService.fetchFeed(this.feedType, this.pageNum)
        fetchFeed(feedType, pageNum)
            .then((data) => {
                if (!cancelled) {
                    setItems(data);
                    // Replaces: this.listStart = ((this.pageNum - 1) * 30) + 1;
                    setListStart((pageNum - 1) * 30 + 1);
                    // Replaces: window.scrollTo(0, 0) in the complete callback
                    window.scrollTo(0, 0);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    // Replaces: error => this.errorMessage = 'Could not load ...'
                    setErrorMessage('Could not load ' + feedType + ' stories.');
                }
            });

        // Cleanup replaces Angular Subscription.unsubscribe()
        // (which the original Angular code actually forgot to call in ngOnDestroy)
        return () => {
            cancelled = true;
        };
    }, [feedType, pageNum]);

    return null;
}
