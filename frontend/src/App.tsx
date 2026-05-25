import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ConfirmTasks from './pages/ConfirmTasks';
import Briefing from './pages/Briefing';
import TaskDetail from './pages/TaskDetail';
import DataSources from './pages/DataSources';
import Notifications from './pages/Notifications';
import AdminUsers from './pages/AdminUsers';
import AppShell, { type Page } from './components/AppShell';
import type { TodoItem } from './types/api.types';

const TOTAL_CANDIDATES = 5;

function App() {
  const [loggedIn, setLoggedIn]               = useState(false);
  const [page, setPage]                       = useState<Page>('dashboard');
  const [pendingCount, setPendingCount]       = useState(TOTAL_CANDIDATES);
  const [selectedTask, setSelectedTask]       = useState<TodoItem | null>(null);
  const [addSourceTrigger, setAddSourceTrigger] = useState(0);
  const [theme, setTheme]                     = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') ?? 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  function handleTaskClick(task: TodoItem) {
    setSelectedTask(task);
    setPage('task-detail');
  }

  function handleBackFromDetail() {
    setPage('dashboard');
    setSelectedTask(null);
  }

  const headerTitle =
    page === 'confirm'       ? `Confirm Tasks (${pendingCount} pending)`
    : page === 'briefing'    ? 'Daily Briefing — Monday, 25 May 2026'
    : page === 'task-detail' ? 'Dashboard › Task Detail'
    : undefined;

  const onBack =
    page === 'briefing'      ? () => setPage('dashboard')
    : page === 'task-detail' ? handleBackFromDetail
    : undefined;

  const headerExtra =
    page === 'sources' ? (
      <button
        onClick={() => setAddSourceTrigger((n) => n + 1)}
        style={{
          height: 34,
          padding: '0 14px',
          background: '#F26522',
          border: 'none',
          borderRadius: 8,
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'Inter, system-ui, sans-serif',
          cursor: 'pointer',
        }}
      >
        + Add Source
      </button>
    ) : undefined;

  return (
    <AppShell
      activePage={page}
      onNavigate={(p) => { setPage(p); setSelectedTask(null); }}
      onLogout={() => setLoggedIn(false)}
      headerTitle={headerTitle}
      headerExtra={headerExtra}
      onBack={onBack}
      theme={theme}
      onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
    >
      {page === 'dashboard'      && <Dashboard onTaskClick={handleTaskClick} />}
      {page === 'confirm'        && (
        <ConfirmTasks onSubmit={() => { setPendingCount(0); setPage('dashboard'); }} />
      )}
      {page === 'briefing'       && <Briefing />}
      {page === 'sources'        && <DataSources addTrigger={addSourceTrigger} />}
      {page === 'notifications'  && <Notifications />}
      {page === 'users'          && <AdminUsers />}
      {page === 'task-detail'    && selectedTask && (
        <TaskDetail task={selectedTask} onBack={handleBackFromDetail} />
      )}
      {!['dashboard', 'confirm', 'briefing', 'sources', 'notifications', 'users', 'task-detail'].includes(page) && (
        <div style={{ color: 'var(--color-text-muted)', paddingTop: 48, textAlign: 'center' }}>
          This page is coming soon.
        </div>
      )}
    </AppShell>
  );
}

export default App;
