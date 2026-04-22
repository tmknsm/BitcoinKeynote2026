import { type ReactNode } from 'react';
import './AListUnordered.css';

export interface AListUnorderedItem {
  /** Optional 24px leading icon. */
  icon?: ReactNode;
  /** Primary text label. */
  label: string;
  /** Optional body text below the label. */
  body?: string;
  /** Optional right-aligned value (enables 2-column layout). */
  value?: string;
}

export interface AListUnorderedProps {
  items: AListUnorderedItem[];
  /** Compact has tighter spacing; large adds more row gap and vertical padding. */
  size?: 'compact' | 'large';
  className?: string;
}

export function AListUnordered({ items, size = 'compact', className }: AListUnorderedProps) {
  const hasValues = items.some((item) => item.value != null);
  const hasBody = items.some((item) => item.body != null);

  const classes = [
    'a-list-unordered',
    `a-list-unordered--${size}`,
    hasBody && 'a-list-unordered--with-body',
    hasValues && 'a-list-unordered--two-col',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {items.map((item, i) => (
        <div key={i} className="a-list-unordered__row">
          <div className="a-list-unordered__leading">
            {item.icon && (
              <span className="a-list-unordered__icon">{item.icon}</span>
            )}
            <div className="a-list-unordered__text">
              <span className="a-list-unordered__label">{item.label}</span>
              {item.body && (
                <span className="a-list-unordered__body">{item.body}</span>
              )}
            </div>
          </div>
          {item.value != null && (
            <span className="a-list-unordered__value">{item.value}</span>
          )}
        </div>
      ))}
    </div>
  );
}

AListUnordered.displayName = 'AListUnordered';
