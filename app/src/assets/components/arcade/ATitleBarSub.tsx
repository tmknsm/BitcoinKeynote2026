import { type ReactNode } from 'react';
import { AIcon } from './AIcon';
import './ATitleBarSub.css';

export interface ATitleBarSubProps {
  /** Parent shows close (×), child shows back (←). */
  type?: 'parent' | 'child';
  /** Default has an opaque background; transparent has blurred pill buttons. */
  variant?: 'default' | 'transparent';
  /** Optional centered page title. */
  title?: string;
  /** Called when the navigation icon (back/close) is tapped. */
  onNavigationPress?: () => void;
  /** Up to 2 trailing action icons (rendered right to left). */
  actions?: ReactNode[];
  className?: string;
}

export function ATitleBarSub({
  type = 'child',
  variant = 'default',
  title,
  onNavigationPress,
  actions = [],
  className,
}: ATitleBarSubProps) {
  const navIcon = type === 'parent' ? 'close' : 'back';

  const classes = [
    'a-title-bar-sub',
    `a-title-bar-sub--${variant}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div className="a-title-bar-sub__content">
        <button
          className="a-title-bar-sub__nav-btn"
          onClick={onNavigationPress}
          aria-label={type === 'parent' ? 'Close' : 'Back'}
        >
          <AIcon name={navIcon} set="navigation" />
        </button>

        {title && (
          <span className="a-title-bar-sub__title">{title}</span>
        )}

        {actions.length > 0 && (
          <div className="a-title-bar-sub__actions">
            {actions.map((action, i) => (
              <div key={i} className="a-title-bar-sub__action-btn">
                {action}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

ATitleBarSub.displayName = 'ATitleBarSub';
