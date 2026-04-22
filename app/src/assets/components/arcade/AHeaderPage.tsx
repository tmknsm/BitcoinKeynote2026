import { type ReactNode } from 'react';
import './AHeaderPage.css';

export interface AHeaderPageProps {
  /** Optional 64×64 avatar element displayed above the header. */
  avatar?: ReactNode;
  /** Page header title text. */
  header: string;
  /** Optional body text below the header. */
  body?: string;
  className?: string;
}

export function AHeaderPage({ avatar, header, body, className }: AHeaderPageProps) {
  const classes = ['a-header-page', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {avatar && <div className="a-header-page__avatar">{avatar}</div>}
      <div className="a-header-page__text">
        <h2 className="a-header-page__title">{header}</h2>
        {body && <p className="a-header-page__body">{body}</p>}
      </div>
    </div>
  );
}

AHeaderPage.displayName = 'AHeaderPage';
