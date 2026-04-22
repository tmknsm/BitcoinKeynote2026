import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import './AInputChip.css';

export interface AInputChipProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Whether the chip is currently selected (bold border). */
  selected?: boolean;
  /** Icon content — renders the icon label type instead of text. */
  icon?: ReactNode;
  /** Text label (e.g. "$100"). Ignored when `icon` is provided. */
  children?: ReactNode;
}

export const AInputChip = forwardRef<HTMLButtonElement, AInputChipProps>(
  ({ selected = false, icon, children, className, disabled, ...rest }, ref) => {
    const classes = [
      'a-input-chip',
      selected && 'a-input-chip--selected',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled}
        aria-pressed={selected}
        {...rest}
      >
        {icon ? (
          <span className="a-input-chip__icon">{icon}</span>
        ) : (
          <span className="a-input-chip__label">{children}</span>
        )}
      </button>
    );
  },
);

AInputChip.displayName = 'AInputChip';
