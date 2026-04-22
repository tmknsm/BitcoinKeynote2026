import { type ButtonHTMLAttributes } from 'react';
import { AIcon } from './AIcon';
import './ABottomNavigation.css';

export type NavTab = 'money' | 'keypad' | 'activity';
export type NavVariant = 'standard' | 'glass';

export interface ABottomNavigationProps {
  activeTab?: NavTab;
  variant?: NavVariant;
  /** When true and Money tab is active, shows balance text instead of icon */
  showBalance?: boolean;
  /** Balance string to display, e.g. "$325" */
  balance?: string;
  /** Called when a tab is tapped */
  onTabPress?: (tab: NavTab) => void;
  className?: string;
}

function TabButton({
  active,
  children,
  ...rest
}: { active: boolean; children: React.ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`a-bottom-nav__tab ${active ? 'a-bottom-nav__tab--active' : ''}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ABottomNavigation({
  activeTab = 'money',
  variant = 'standard',
  showBalance = false,
  balance = '$325',
  onTabPress,
  className,
}: ABottomNavigationProps) {
  const classes = [
    'a-bottom-nav',
    `a-bottom-nav--${variant}`,
    className,
  ].filter(Boolean).join(' ');
  const showBalanceText = showBalance && activeTab === 'money';

  return (
    <div className={classes}>
      {variant === 'glass' && (
        <div className="a-bottom-nav__glass-pill">
          <div className="a-bottom-nav__glass-bg">
            <div className="a-bottom-nav__glass-blur" />
            <div className="a-bottom-nav__glass-fill" />
            <div className="a-bottom-nav__glass-overlay" />
          </div>
          <div className="a-bottom-nav__glass-tabs">
            <TabButton active={activeTab === 'money'} onClick={() => onTabPress?.('money')}>
              {showBalanceText ? (
                <span className="a-bottom-nav__balance">{balance}</span>
              ) : (
                <AIcon name="money" set="navigation" size={24} />
              )}
            </TabButton>
            <TabButton active={activeTab === 'keypad'} onClick={() => onTabPress?.('keypad')}>
              <AIcon name="logo-usd" set={24} />
            </TabButton>
            <TabButton active={activeTab === 'activity'} onClick={() => onTabPress?.('activity')}>
              <AIcon name="activity" set="navigation" size={24} />
            </TabButton>
          </div>
        </div>
      )}
      {variant === 'standard' && (
        <div className="a-bottom-nav__tabs">
          <TabButton active={activeTab === 'money'} onClick={() => onTabPress?.('money')}>
            {showBalanceText ? (
              <span className="a-bottom-nav__balance">{balance}</span>
            ) : (
              <AIcon name="money" set="navigation" size={24} />
            )}
          </TabButton>
          <TabButton active={activeTab === 'keypad'} onClick={() => onTabPress?.('keypad')}>
            <AIcon name="logo-usd" set={24} />
          </TabButton>
          <TabButton active={activeTab === 'activity'} onClick={() => onTabPress?.('activity')}>
            <AIcon name="activity" set="navigation" size={24} />
          </TabButton>
        </div>
      )}
      <div className="a-bottom-nav__home-indicator">
        <div className="a-bottom-nav__home-indicator-bar" />
      </div>
    </div>
  );
}
