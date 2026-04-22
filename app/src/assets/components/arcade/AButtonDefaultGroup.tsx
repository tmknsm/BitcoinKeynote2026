import { type ReactNode } from 'react';
import './AButtonDefaultGroup.css';

export interface AButtonDefaultGroupProps {
  orientation?: 'vertical' | 'horizontal';
  children: ReactNode;
  className?: string;
}

export function AButtonDefaultGroup({
  orientation = 'vertical',
  children,
  className,
}: AButtonDefaultGroupProps) {
  const classes = [
    'a-button-default-group',
    `a-button-default-group--${orientation}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
}
