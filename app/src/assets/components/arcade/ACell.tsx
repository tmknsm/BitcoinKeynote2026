import { type ReactNode } from 'react';
import './ACell.css';

export interface ACellProps {
  /** Primary label text. */
  label?: string;
  /** Secondary body text — string for one line, array for multiple. */
  body?: string | string[];
  /** Leading asset element (avatar, icon). */
  asset?: ReactNode;
  /** Image URL for a 48px circular avatar. Shorthand alternative to asset. */
  image?: string;
  /** Trailing accessory element (push chevron, label, toggle, button). */
  accessory?: ReactNode;
  /** Custom text content — overrides label and body when provided. */
  textSlot?: ReactNode;
  /** Visual state of the cell. */
  state?: 'default' | 'pressed' | 'disabled';
  /** Click handler. */
  onClick?: () => void;
  /** Optional CSS class. */
  className?: string;
}

export function ACell({
  label,
  body,
  asset,
  image,
  accessory,
  textSlot,
  state = 'default',
  onClick,
  className,
}: ACellProps) {
  const disabled = state === 'disabled';
  const bodies = body == null ? [] : Array.isArray(body) ? body : [body];

  const classes = [
    'a-cell',
    state !== 'default' && `a-cell--${state}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      onClick={disabled ? undefined : onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
    >
      {(asset || image) && (
        <div className={`a-cell__asset${disabled ? ' a-cell__asset--disabled' : ''}`}>
          {image ? <img className="a-cell__image" src={image} alt="" /> : asset}
        </div>
      )}
      <div className="a-cell__main">
        <div className={`a-cell__text${disabled ? ' a-cell__text--disabled' : ''}`}>
          {textSlot || (
            <>
              {label && <span className="a-cell__label">{label}</span>}
              {bodies.map((b, i) => (
                <span key={i} className="a-cell__body">{b}</span>
              ))}
            </>
          )}
        </div>
        {accessory && (
          <div className={`a-cell__accessory${disabled ? ' a-cell__accessory--disabled' : ''}`}>
            {accessory}
          </div>
        )}
      </div>
    </div>
  );
}

ACell.displayName = 'ACell';
