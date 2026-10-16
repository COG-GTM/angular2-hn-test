import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Comment as CommentType } from '../../models/comment';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import { buttonProps } from '../../utils/a11y';
import './Comment.scss';

interface CommentProps {
    comment: CommentType;
}

export function CommentItem({ comment }: CommentProps) {
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
                    {...buttonProps(() => setCollapse((c) => !c), collapse ? 'Expand comment' : 'Collapse comment')}
                >
                    [{collapse ? '+' : '-'}]
                </span>{' '}
                <Link to={`/user/${comment.user}`}>{comment.user}</Link>
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
}
