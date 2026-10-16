import { useParams, useNavigate } from 'react-router-dom';
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
    const { data: user, error } = useAsyncResource(`user/${id}`, id ? () => fetchUser(id) : null);

    return (
        <>
            {!user && !error && <Loader />}
            {!user && error && <ErrorMessage message={`Could not load user ${id}.`} />}

            {user && (
                <div className="profile">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" {...buttonProps(() => navigate(-1), 'Go back')}></span>
                            Profile: {user.id}
                        </p>
                    </div>
                    <div className="main-details">
                        <span className="name">{user.id}</span>
                        <span className="right">{user.karma} ★</span>
                        <p className="age">Created {user.created}</p>
                    </div>
                    {user.about && (
                        <div className="other-details">
                            <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(user.about) }} />
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
