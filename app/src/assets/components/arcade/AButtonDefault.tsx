import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import './AButtonDefault.css';

export interface AButtonDefaultProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  prominence?: 'prominent' | 'standard' | 'subtle';
  destructive?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

export const AButtonDefault = forwardRef<HTMLButtonElement, AButtonDefaultProps>(
  (
    {
      prominence = 'standard',
      destructive = false,
      loading = false,
      icon,
      children,
      className,
      disabled,
      ...rest
    },
    ref,
  ) => {
    const classes = [
      'a-button-default',
      `a-button-default--${prominence}`,
      destructive && 'a-button-default--destructive',
      loading && 'a-button-default--loading',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...rest}
      >
        {icon && <span className="a-button-default__icon">{icon}</span>}
        {children && <span className="a-button-default__label">{children}</span>}
        {loading && <span className="a-button-default__spinner" />}
      </button>
    );
  },
);

AButtonDefault.displayName = 'AButtonDefault';
