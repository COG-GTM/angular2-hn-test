import { memo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Comment as CommentType } from '../../models/comment';
import { buttonProps } from '../../utils/a11y';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import './Comment.scss';

interface CommentProps {
    comment: CommentType;
}

/**
 * Port of Angular's recursive `app-comment`. Collapsing only hides the text and subtree
 * (Angular's `[hidden]`), so nested comments stay mounted and keep their own collapse state.
 */
export const CommentItem = memo(function CommentItem({ comment }: CommentProps) {
    const [collapse, setCollapse] = useState(false);

    if (comment.deleted) {
        return (
            <div className="comment">
                <div className="deleted-meta">
                    <span className="collapse">[deleted]</span> | Comment Deleted
                </div>
            </div>
        );
    }

    return (
        <div className="comment">
            <div className={`meta${collapse ? ' meta-collapse' : ''}`}>
                <span
                    className="collapse"
                    aria-expanded={!collapse}
                    {...buttonProps(
                        () => setCollapse((value) => !value),
                        `${collapse ? 'Expand' : 'Collapse'} comment by ${comment.user}`
                    )}
                >
                    [{collapse ? '+' : '-'}]
                </span>
                <NavLink to={`/user/${comment.user}`}>{comment.user}</NavLink>
                <span className="time">{comment.time_ago}</span>
            </div>
            <div className="comment-tree">
                <div hidden={collapse}>
                    <p className="comment-text" dangerouslySetInnerHTML={{ __html: sanitizeHtml(comment.content) }} />
                    <ul className="subtree">
                        {comment.comments?.map((subComment) => (
                            <li key={subComment.id}>
                                <CommentItem comment={subComment} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
});
