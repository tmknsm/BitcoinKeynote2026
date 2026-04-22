import { forwardRef, type HTMLAttributes } from 'react';
import './AInputChipGrid.css';

export interface AInputChipGridProps extends HTMLAttributes<HTMLDivElement> {}

export const AInputChipGrid = forwardRef<HTMLDivElement, AInputChipGridProps>(
  ({ className, children, ...rest }, ref) => {
    const classes = ['a-input-chip-grid', className].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classes} {...rest}>
        {children}
      </div>
    );
  },
);

AInputChipGrid.displayName = 'AInputChipGrid';
