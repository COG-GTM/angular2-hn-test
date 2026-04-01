import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Story } from '../../models/story';
import { FeedName } from '../../models/feed-type';
import { fetchFeed } from '../../services/hackerNewsApi';
import { Item } from '../Item/Item';
import { Loader } from '../Loader/Loader';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
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

    /**
     * Template conversion from Angular:
     *   - *ngIf="!items && !errorMessage" → conditional && rendering for Loader
     *   - *ngIf="!items && errorMessage !==''" → conditional && for ErrorMessage
     *   - *ngIf="items" → conditional && for main content
     *   - *ngIf="feedType === 'jobs'" → conditional && for job header
     *   - *ngFor="let item of items" → items.map(...)
     *   - [routerLink] → <Link to={...}>
     *   - [class.list-margin] → className conditional
     *   - start="{{ listStart }}" → start={listStart}
     *   - <item [item]="item"> → <Item item={item} />
     *   - <app-loader> → <Loader />
     *   - <app-error-message [message]="errorMessage"> → <ErrorMessage message={errorMessage} />
     */
    return (
        <div className="main-content">
            {/* Replaces: <app-loader *ngIf="!items && !errorMessage"> */}
            {!items && !errorMessage && <Loader />}
            {/* Replaces: <app-error-message [message]="errorMessage" *ngIf="!items && errorMessage !==''"> */}
            {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {/* Replaces: <div *ngIf="items"> */}
            {items && (
                <div>
                    {/* Replaces: <p class="job-header" *ngIf="feedType === 'jobs'"> */}
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator.
                            You can also get a job at a YC startup through{' '}
                            <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    {/* Replaces: <ol *ngIf="feedType !== 'new'" [class.list-margin]="feedType !== 'jobs'" start="{{ listStart }}"> */}
                    <ol
                        className={feedType !== 'jobs' ? 'list-margin' : undefined}
                        start={listStart}
                    >
                        {/* Replaces: <li *ngFor="let item of items" class="post"> */}
                        {items.map((item) => (
                            <li key={item.id} className="post">
                                {/* Replaces: <item class="item-block" [item]="item"> */}
                                <Item item={item} />
                            </li>
                        ))}
                    </ol>
                    {/* Replaces: <div class="nav"> with [routerLink] navigation */}
                    <div className="nav">
                        {/* Replaces: <a *ngIf="listStart !== 1" [routerLink]="['/' + feedType, pageNum - 1]"> */}
                        {listStart !== 1 && (
                            <Link to={`/migrated/${feedType}/${pageNum - 1}`} className="prev">
                                ‹ Prev
                            </Link>
                        )}
                        {/* Replaces: <a *ngIf="items.length === 30" [routerLink]="['/' + feedType, pageNum + 1]"> */}
                        {items.length === 30 && (
                            <Link to={`/migrated/${feedType}/${pageNum + 1}`} className="more">
                                More ›
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
