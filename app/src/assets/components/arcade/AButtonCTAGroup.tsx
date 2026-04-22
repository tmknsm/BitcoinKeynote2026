import { type ReactNode } from 'react';
import './AButtonCTAGroup.css';

export interface AButtonCTAGroupProps {
  orientation?: 'vertical' | 'horizontal';
  showHairline?: boolean;
  disclaimer?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AButtonCTAGroup({
  orientation = 'vertical',
  showHairline = false,
  disclaimer,
  children,
  className,
}: AButtonCTAGroupProps) {
  const classes = [
    'a-button-cta-group',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const buttonClasses = [
    'a-button-cta-group__buttons',
    `a-button-cta-group__buttons--${orientation}`,
  ].join(' ');

  return (
    <div className={classes}>
      {showHairline && <div className="a-button-cta-group__hairline" />}
      <div className="a-button-cta-group__content">
        {disclaimer && (
          <div className="a-button-cta-group__disclaimer">{disclaimer}</div>
        )}
        <div className={buttonClasses}>{children}</div>
      </div>
    </div>
  );
}
