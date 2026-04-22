import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import './AButtonCTA.css';

export interface AButtonCTAProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  prominence?: 'prominent' | 'standard' | 'subtle';
  destructive?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

export const AButtonCTA = forwardRef<HTMLButtonElement, AButtonCTAProps>(
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
      'a-button-cta',
      `a-button-cta--${prominence}`,
      destructive && 'a-button-cta--destructive',
      loading && 'a-button-cta--loading',
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
        {icon && <span className="a-button-cta__icon">{icon}</span>}
        {children && <span className="a-button-cta__label">{children}</span>}
        {loading && <span className="a-button-cta__spinner" />}
      </button>
    );
  },
);

AButtonCTA.displayName = 'AButtonCTA';
