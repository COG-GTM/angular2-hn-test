import { useEffect, useRef } from 'react';
import { useSettings } from '../../context/useSettings';
import { buttonProps } from '../../utils/a11y';
import './Settings.scss';

const THEMES = [
    { value: 'default', label: 'Default' },
    { value: 'night', label: 'Night' },
    { value: 'amoledblack', label: 'Black (AMOLED)' },
];

export function Settings() {
    const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();
    const closeRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        closeRef.current?.focus();
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') toggleSettings();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [toggleSettings]);

    return (
        <div id="popup1" className="overlay">
            <div className="popup" role="dialog" aria-modal="true" aria-labelledby="settings-title">
                <h1 id="settings-title">Settings</h1>
                <hr />
                <span className="close" ref={closeRef} {...buttonProps(toggleSettings, 'Close settings')}>
                    &times;
                </span>
                <div className="content">
                    <div className="control-section">
                        <h2>Links</h2>
                        <input
                            type="checkbox"
                            aria-label="Open links in a new tab"
                            checked={settings.openLinkInNewTab}
                            onChange={toggleOpenLinksInNewTab}
                        />{' '}
                        Open links in a new tab
                    </div>
                    <div className="theme-controls">
                        <div className="control-section">
                            <h2>Select a theme</h2>
                            {THEMES.map(({ value, label }) => (
                                <div key={value}>
                                    <label>
                                        <input
                                            name="theme"
                                            type="radio"
                                            value={value}
                                            checked={settings.theme === value}
                                            onChange={() => setTheme(value)}
                                        />{' '}
                                        {label}
                                    </label>
                                </div>
                            ))}
                        </div>
                        <div className="control-section">
                            <h2>Change Font</h2>
                            <div>
                                <label>
                                    Font size:
                                    <input
                                        min="1"
                                        value={settings.titleFontSize}
                                        name="theme"
                                        type="number"
                                        onChange={(e) => setFont(e.target.value)}
                                    />
                                </label>
                            </div>
                            <div>
                                <label>
                                    List spacing:
                                    <input
                                        min="0"
                                        value={settings.listSpacing}
                                        name="theme"
                                        type="number"
                                        onChange={(e) => setSpacing(e.target.value)}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
