import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/useSettings';
import { fetchItemContent } from '../../services/hackerNewsApi';
import { formatCommentCount } from '../../utils/formatCommentCount';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import { hasExternalUrl, pollBarWidth } from '../../utils/story';
import { useAsyncResource } from '../../utils/useAsyncResource';
import { buttonProps } from '../../utils/a11y';
import { CommentItem } from '../Comment/Comment';
import { Loader } from '../Loader/Loader';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import './ItemDetails.scss';

export function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const itemId = Number(id);
    const validId = Number.isInteger(itemId) && itemId > 0;
    const { data: item, error } = useAsyncResource(
        `item/${id}`,
        validId ? () => fetchItemContent(itemId) : null
    );

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const linkTarget = {
        target: settings.openLinkInNewTab ? '_blank' : undefined,
        rel: settings.openLinkInNewTab ? 'noopener' : undefined,
    };
    const hasUrl = item ? hasExternalUrl(item) : false;

    return (
        <div className="main-content item-details-view">
            {!item && !error && <Loader />}
            {!item && error && <ErrorMessage message="Could not load item comments." />}

            {item && (
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" {...buttonProps(() => navigate(-1), 'Go back')}></span>
                            {hasUrl ? (
                                <a className="title" href={item.url} {...linkTarget}>
                                    {item.title}
                                </a>
                            ) : (
                                <Link className="title" to={`/item/${item.id}`}>
                                    {item.title}
                                </Link>
                            )}
                        </p>
                    </div>
                    <div
                        className={[
                            'laptop',
                            item.comments_count > 0 || item.type === 'job' ? 'item-header' : '',
                            item.text ? 'head-margin' : '',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                    >
                        {hasUrl ? (
                            <p>
                                <a className="title" href={item.url} {...linkTarget}>
                                    {item.title}
                                </a>{' '}
                                {item.domain && <span className="domain">({item.domain})</span>}
                            </p>
                        ) : (
                            <p>
                                <Link className="title" to={`/item/${item.id}`}>
                                    {item.title}
                                </Link>
                            </p>
                        )}
                        <div className="subtext">
                            {item.type !== 'job' && (
                                <span>
                                    {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>{' '}
                                </span>
                            )}
                            <span className={item.type !== 'job' ? 'item-details' : undefined}>
                                {item.time_ago}
                                {item.type !== 'job' && (
                                    <span>
                                        {' '}
                                        |{' '}
                                        <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link>
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    {item.type === 'poll' && item.poll && (
                        <div className="pollResults">
                            {item.poll.map((pollResult, index) => (
                                <div key={index} className="pollContent">
                                    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(pollResult.content) }} />
                                    <div className="subtext">{pollResult.points} points</div>
                                    <div
                                        className="pollBar"
                                        style={{ width: pollBarWidth(pollResult.points, item.poll_votes_count) }}
                                    ></div>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="subject" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }} />
                    <ul className="comment-list">
                        {item.comments?.map((comment) => (
                            <li key={comment.id}>
                                <CommentItem comment={comment} />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
