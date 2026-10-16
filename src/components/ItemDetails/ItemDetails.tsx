import { useEffect } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { Story } from '../../models/story';
import { useSettings } from '../../context/useSettings';
import { fetchItemContent } from '../../services/hackerNewsApi';
import { buttonProps } from '../../utils/a11y';
import { formatCommentCount } from '../../utils/formatCommentCount';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import { hasExternalUrl, parsePositiveInt } from '../../utils/story';
import { useAsyncResource } from '../../utils/useAsyncResource';
import { CommentItem } from '../Comment/Comment';
import { Loader } from '../Loader/Loader';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { pollBarWidth } from './pollBarWidth';
import './ItemDetails.scss';

export function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const itemId = parsePositiveInt(id);
    const navigate = useNavigate();
    const { settings } = useSettings();
    const { data: item, error } = useAsyncResource<Story>(
        `item/${id}`,
        itemId === null ? null : () => fetchItemContent(itemId)
    );

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const goBack = () => navigate(-1);

    const externalLinkProps = {
        target: settings.openLinkInNewTab ? '_blank' : undefined,
        rel: settings.openLinkInNewTab ? 'noopener' : undefined,
    };

    const renderTitle = (story: Story) =>
        hasExternalUrl(story) ? (
            <a className="title" href={story.url} {...externalLinkProps}>
                {story.title}
            </a>
        ) : (
            <NavLink className="title" to={`/item/${story.id}`}>
                {story.title}
            </NavLink>
        );

    const laptopClasses = ['laptop'];
    if (item && (item.comments_count > 0 || item.type === 'job')) laptopClasses.push('item-header');
    if (item?.text) laptopClasses.push('head-margin');

    return (
        <div className="main-content item-page">
            {!item && !error && <Loader />}
            {!item && error && <ErrorMessage message="Could not load item comments." />}

            {item && (
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" {...buttonProps(goBack, 'Go back')}></span>
                            {renderTitle(item)}
                        </p>
                    </div>
                    <div className={laptopClasses.join(' ')}>
                        <p>
                            {renderTitle(item)}
                            {hasExternalUrl(item) && item.domain && (
                                <>
                                    {' '}
                                    <span className="domain">({item.domain})</span>
                                </>
                            )}
                        </p>
                        <div className="subtext">
                            {item.type !== 'job' && (
                                <span>
                                    {item.points} points by{' '}
                                    <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>
                                </span>
                            )}
                            <span className={item.type !== 'job' ? 'item-details' : undefined}>
                                {item.time_ago}
                                {item.type !== 'job' && (
                                    <span>
                                        {' '}|{' '}
                                        <NavLink to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</NavLink>
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    {item.type === 'poll' && (
                        <div className="pollResults">
                            {(item.poll ?? []).map((pollResult, index) => (
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
