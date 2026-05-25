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
import { apiClient } from './api/client';
import type { TodoItem, TaskGroup } from './types/api.types';

function App() {
  const [loggedIn, setLoggedIn]               = useState(false);
  const [page, setPage]                       = useState<Page>('dashboard');
  const [selectedTask, setSelectedTask]       = useState<TodoItem | null>(null);
  const [addSourceTrigger, setAddSourceTrigger] = useState(0);
  const [theme, setTheme]                     = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') ?? 'dark';
  });

  // Agent pipeline state
  const [agentGroups, setAgentGroups]         = useState<TaskGroup[]>([]);
  const [agentLoading, setAgentLoading]       = useState(false);
  const [agentError, setAgentError]           = useState<string | null>(null);
  const [pendingCount, setPendingCount]       = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  async function handleRunAgent() {
    setAgentLoading(true);
    setAgentError(null);
    try {
      const result = await apiClient.runAgent();
      if (result.success) {
        setAgentGroups(result.data.groups || []);
        const pendingTasks = (result.data.groups || []).reduce(
          (sum: number, g: TaskGroup) => sum + g.candidates.length,
          0
        );
        setPendingCount(pendingTasks);
        setPage('confirm');
      } else {
        setAgentError('Failed to run agent pipeline');
      }
    } catch (error) {
      setAgentError(error instanceof Error ? error.message : 'API error');
    } finally {
      setAgentLoading(false);
    }
  }

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

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const headerTitle =
    page === 'confirm'       ? `Confirm Tasks (${pendingCount} pending)`
    : page === 'briefing'    ? `Daily Briefing — ${today}`
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
      onRunAgent={handleRunAgent}
      agentLoading={agentLoading}
    >
      {page === 'dashboard'      && <Dashboard onTaskClick={handleTaskClick} />}
      {page === 'confirm'        && (
        <ConfirmTasks
          groups={agentGroups}
          onSubmit={() => { setPendingCount(0); setAgentGroups([]); setPage('dashboard'); }}
        />
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
