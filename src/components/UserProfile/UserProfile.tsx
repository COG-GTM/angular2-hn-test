import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { fetchUser } from '../../services/hackerNewsApi';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import { useAsyncResource } from '../../utils/useAsyncResource';
import { buttonProps } from '../../utils/a11y';
import { Loader } from '../Loader/Loader';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import './UserProfile.scss';

export function UserProfile() {
    const { id = '' } = useParams<{ id: string }>();
    const navigate = useNavigate();
    // Keyed per history entry so revisiting an id (a -> b -> a) shows the loader, not the earlier result.
    const { key: visit } = useLocation();
    const { data: user, error } = useAsyncResource(`user/${id}/${visit}`, id ? () => fetchUser(id) : null);

    const goBack = () => {
        navigate(-1);
    };

    if (error) {
        return <ErrorMessage message={'Could not load user ' + id + '.'} />;
    }
    if (!user) {
        return <Loader />;
    }

    const about = sanitizeHtml(user.about);

    return (
        <div className="profile">
            <div className="mobile item-header">
                <p className="title-block">
                    <span className="back-button" {...buttonProps(goBack, 'Back')}></span>
                    Profile: {user.id}
                </p>
            </div>
            <div className="main-details">
                <span className="name">{user.id}</span>
                <span className="right">{user.karma} ★</span>
                <p className="age">Created {user.created}</p>
            </div>
            {about && (
                <div className="other-details">
                    <p dangerouslySetInnerHTML={{ __html: about }} />
                </div>
            )}
        </div>
    );
}
