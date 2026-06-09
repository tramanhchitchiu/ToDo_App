import React from 'react';
import styles from './AppShell.module.css';

export type Page =
  | 'dashboard'
  | 'confirm'
  | 'briefing'
  | 'sources'
  | 'notifications'
  | 'users'
  | 'task-detail';

interface AppShellProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  children: React.ReactNode;
  headerTitle?: string;
  headerExtra?: React.ReactNode;
  onBack?: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onRunAgent?: () => void;
  agentLoading?: boolean;
  confirmBadge?: number;
}

const PAGE_LABELS: Record<Page, string> = {
  dashboard:     'Dashboard',
  confirm:       'Confirm Tasks',
  briefing:      'Daily Briefing',
  sources:       'Data Sources',
  notifications: 'Notifications',
  users:         'Admin / Users',
  'task-detail': 'Task Detail',
};

export function AppShell({ activePage, onNavigate, onLogout, children, headerTitle, headerExtra, onBack, theme, onToggleTheme, onRunAgent, agentLoading, confirmBadge }: AppShellProps) {
  return (
    <>
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <p className={styles.logoTitle}>🤱 Task Mom 24/7</p>
        </div>

        <nav className={styles.nav}>
          <NavItem id="dashboard" label="Dashboard" active={activePage === 'dashboard'} onNavigate={onNavigate} />
          <NavItem id="confirm" label="Confirm Tasks" badge={confirmBadge && confirmBadge > 0 ? confirmBadge : undefined} active={activePage === 'confirm'} onNavigate={onNavigate} />
          <NavItem id="briefing" label="Daily Briefing" active={activePage === 'briefing'} onNavigate={onNavigate} />
          <div className={styles.navDivider} />
          <NavItem id="sources" label="Data Sources" active={activePage === 'sources'} onNavigate={onNavigate} />
          <NavItem id="notifications" label="Notifications" active={activePage === 'notifications'} onNavigate={onNavigate} />
          <div className={styles.navDivider} />
          <NavItem id="users" label="Admin / Users" active={activePage === 'users'} secondary onNavigate={onNavigate} />
        </nav>

        <div className={styles.userArea}>
          <div className={styles.avatar}>NL</div>
          <span className={styles.userName}>Nguyen T. Linh</span>
          <button className={styles.settingsBtn} aria-label="Settings" onClick={() => onNavigate('users')}>⚙</button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          {onBack && (
            <button className={styles.backBtn} onClick={onBack}>← Back</button>
          )}
          <span className={styles.breadcrumb}>{headerTitle ?? PAGE_LABELS[activePage]}</span>
          <div className={styles.headerActions}>
            {headerExtra}
            <button
              className={styles.runBtn}
              onClick={onRunAgent}
              disabled={agentLoading}
              title={agentLoading ? 'Running agent pipeline...' : 'Run agent pipeline'}
            >
              {agentLoading ? '⏳ Running...' : 'Run Ingestion'}
            </button>
            <button
              className={styles.themeBtn}
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? '☀' : '🌙'}
            </button>
            <div className={styles.bellWrapper}>
              <span className={styles.bellIcon}>🔔</span>
              <span className={styles.bellBadge}>3</span>
            </div>
            <div className={styles.userChip}>
              <div className={styles.headerAvatar}>NL</div>
              <span className={styles.headerUserName}>Linh</span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>▾</span>
            </div>
            <button className={styles.logoutBtn} onClick={onLogout}>Logout</button>
          </div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </>
  );
}

interface NavItemProps {
  id: Page;
  label: string;
  badge?: number;
  active: boolean;
  secondary?: boolean;
  onNavigate: (page: Page) => void;
}

function NavItem({ id, label, badge, active, secondary, onNavigate }: NavItemProps) {
  const cls = [
    styles.navItem,
    active ? styles.navItemActive : '',
    secondary && !active ? styles.navItemSecondary : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls} onClick={() => onNavigate(id)}>
      {label}
      {badge !== undefined && <span className={styles.navBadge}>{badge}</span>}
    </div>
  );
}

export default AppShell;
