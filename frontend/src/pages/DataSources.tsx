import React, { useState, useEffect, useRef } from 'react';
import styles from './DataSources.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

type SourceType = 'jira' | 'email' | 'meeting' | 'teams' | 'slack';
type SourceStatus = 'active' | 'manual' | 'inactive';

interface SourceConfig {
  id: string;
  type: SourceType;
  name: string;
  status: SourceStatus;
  endpoint?: string;
  account?: string;
  pollingInterval?: number; // minutes
  lastRun?: string;
  lastFile?: string;
}

type FormMode = 'add' | 'edit';

interface FormState {
  mode: FormMode;
  sourceId?: string;
  type: SourceType;
  endpoint: string;
  token: string;
  pollingInterval: string;
  active: boolean;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_SOURCES: SourceConfig[] = [
  {
    id: 's1',
    type: 'jira',
    name: 'Jira',
    status: 'active',
    endpoint: 'fpt.atlassian.net',
    pollingInterval: 30,
    lastRun: '2 min ago',
  },
  {
    id: 's2',
    type: 'email',
    name: 'Email / Exchange',
    status: 'active',
    account: 'linh@fpt.com',
    pollingInterval: 15,
    lastRun: '5 min ago',
  },
  {
    id: 's3',
    type: 'meeting',
    name: 'Meeting Minutes',
    status: 'manual',
    lastFile: 'sprint-3-retro.docx',
    lastRun: 'Yesterday at 14:32',
  },
  {
    id: 's4',
    type: 'teams',
    name: 'Microsoft Teams',
    status: 'inactive',
  },
];

// ─── Style helpers ────────────────────────────────────────────────────────────

const SOURCE_META: Record<SourceType, { icon: string; iconBg: string; iconColor: string }> = {
  jira:    { icon: 'J',  iconBg: 'rgba(59,130,246,0.15)',  iconColor: '#3B82F6' },
  email:   { icon: '✉',  iconBg: 'rgba(139,92,246,0.15)', iconColor: '#8B5CF6' },
  meeting: { icon: '📋', iconBg: 'rgba(20,184,166,0.15)', iconColor: '#14B8A6' },
  teams:   { icon: 'T',  iconBg: 'rgba(99,102,241,0.15)', iconColor: '#6366F1' },
  slack:   { icon: 'S',  iconBg: 'rgba(16,185,129,0.15)', iconColor: '#10B981' },
};

const STATUS_META: Record<SourceStatus, { label: string; dotColor: string; chipBg: string; chipColor: string }> = {
  active:   { label: 'Active',   dotColor: '#10B981', chipBg: 'rgba(16,185,129,0.12)',  chipColor: '#10B981' },
  manual:   { label: 'Manual',   dotColor: '#3B82F6', chipBg: 'rgba(59,130,246,0.12)',  chipColor: '#3B82F6' },
  inactive: { label: 'Inactive', dotColor: '#6B7280', chipBg: 'rgba(107,114,128,0.12)', chipColor: '#6B7280' },
};

// ─── Component ────────────────────────────────────────────────────────────────

interface DataSourcesProps {
  addTrigger?: number;
}

export function DataSources({ addTrigger = 0 }: DataSourcesProps) {
  const [sources, setSources]     = useState<SourceConfig[]>(INITIAL_SOURCES);
  const [form, setForm]           = useState<FormState | null>(null);
  const [running, setRunning]     = useState<Set<string>>(new Set());
  const [removeId, setRemoveId]   = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const prevTrigger               = useRef(addTrigger);

  // Open "add" form when parent increments the trigger
  useEffect(() => {
    if (addTrigger !== prevTrigger.current) {
      prevTrigger.current = addTrigger;
      openAddForm();
    }
  }, [addTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  function openAddForm() {
    setForm({ mode: 'add', type: 'jira', endpoint: '', token: '', pollingInterval: '30', active: true });
    setShowToken(false);
  }

  function openEditForm(src: SourceConfig) {
    setForm({
      mode: 'edit',
      sourceId: src.id,
      type: src.type,
      endpoint: src.endpoint ?? src.account ?? '',
      token: '',
      pollingInterval: String(src.pollingInterval ?? 30),
      active: src.status === 'active',
    });
    setShowToken(false);
  }

  function handleSave() {
    if (!form) return;
    if (form.mode === 'add') {
      const newSrc: SourceConfig = {
        id: `s${Date.now()}`,
        type: form.type,
        name: SOURCE_TYPE_LABELS[form.type],
        status: form.active ? 'active' : 'inactive',
        ...(form.type === 'meeting'
          ? {}
          : form.type === 'email'
          ? { account: form.endpoint, pollingInterval: Number(form.pollingInterval) }
          : { endpoint: form.endpoint, pollingInterval: Number(form.pollingInterval) }),
      };
      setSources((prev) => [...prev, newSrc]);
    } else {
      setSources((prev) =>
        prev.map((s) =>
          s.id === form.sourceId
            ? {
                ...s,
                status: s.status === 'manual' ? 'manual' : form.active ? 'active' : 'inactive',
                endpoint: s.type === 'email' ? s.endpoint : form.endpoint || s.endpoint,
                account: s.type === 'email' ? form.endpoint || s.account : s.account,
                pollingInterval: Number(form.pollingInterval) || s.pollingInterval,
              }
            : s,
        ),
      );
    }
    setForm(null);
  }

  function handleRun(id: string) {
    setRunning((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setRunning((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setSources((prev) =>
        prev.map((s) => (s.id === id ? { ...s, lastRun: 'Just now' } : s)),
      );
    }, 2000);
  }

  function handleRemoveConfirm() {
    if (!removeId) return;
    setSources((prev) => prev.filter((s) => s.id !== removeId));
    if (form?.sourceId === removeId) setForm(null);
    setRemoveId(null);
  }

  const cardClass = (s: SourceConfig) =>
    s.status === 'active'
      ? `${styles.card} ${styles.cardActive}`
      : s.status === 'manual'
      ? `${styles.card} ${styles.cardManual}`
      : `${styles.card} ${styles.cardInactive}`;

  const isManualType = form?.type === 'meeting';

  return (
    <>
      <div className={styles.layout}>
        {/* ── Left column: source list ── */}
        <div>
          <div className={styles.colHeader}>
            <p className={styles.colTitle}>Connected Sources</p>
          </div>

          <div className={styles.sourceList}>
            {sources.map((src) => {
              const meta   = SOURCE_META[src.type];
              const status = STATUS_META[src.status];
              const isRunning = running.has(src.id);

              return (
                <div key={src.id} className={cardClass(src)}>
                  <div className={styles.cardTop}>
                    <div
                      className={styles.sourceIcon}
                      style={{ background: meta.iconBg, color: meta.iconColor }}
                    >
                      {meta.icon}
                    </div>
                    <span className={styles.cardName}>{src.name}</span>
                    <span
                      className={styles.statusChip}
                      style={{ background: status.chipBg, color: status.chipColor }}
                    >
                      <span className={styles.statusDot} style={{ backgroundColor: status.dotColor }} />
                      {status.label}
                    </span>
                    {src.status === 'inactive' ? (
                      <button className={styles.configureBtn} onClick={() => openEditForm(src)}>
                        Configure
                      </button>
                    ) : (
                      <button className={styles.editBtn} onClick={() => openEditForm(src)}>
                        Edit
                      </button>
                    )}
                  </div>

                  <div className={styles.cardDetail}>
                    {src.endpoint && (
                      <>
                        <span>Endpoint:</span>
                        <span className={styles.mono}>{src.endpoint}</span>
                      </>
                    )}
                    {src.account && (
                      <>
                        <span>Account:</span>
                        <span className={styles.mono}>{src.account}</span>
                      </>
                    )}
                    {src.lastFile && (
                      <>
                        <span>Last file:</span>
                        <span className={styles.mono}>{src.lastFile}</span>
                      </>
                    )}
                    {src.pollingInterval && (
                      <>
                        <span className={styles.dot}>·</span>
                        <span>Every {src.pollingInterval} min</span>
                      </>
                    )}
                  </div>

                  {src.lastRun && (
                    <div className={styles.lastRun}>Last run: {src.lastRun}</div>
                  )}

                  <div className={styles.cardActions}>
                    {src.status !== 'inactive' && (
                      <button
                        className={styles.runBtn}
                        disabled={isRunning}
                        onClick={() => handleRun(src.id)}
                      >
                        {isRunning ? (
                          <><div className={styles.spinner} /> Running…</>
                        ) : (
                          '▶ Run Now'
                        )}
                      </button>
                    )}
                    {src.status === 'manual' && (
                      <button className={styles.uploadBtn}>↑ Upload File</button>
                    )}
                    <button className={styles.removeBtn} onClick={() => setRemoveId(src.id)}>
                      🗑 Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right column: form panel ── */}
        <div className={styles.formPanel}>
          {!form ? (
            <div className={styles.formEmpty}>
              <p>Select a source to edit, or click<br /><strong style={{ color: '#F9FAFB' }}>+ Add Source</strong> to connect a new one.</p>
            </div>
          ) : (
            <>
              <p className={styles.formTitle}>
                {form.mode === 'add' ? 'Add New Source' : `Edit — ${SOURCE_TYPE_LABELS[form.type]}`}
              </p>

              {/* Source type */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Source Type</label>
                <select
                  className={styles.formSelect}
                  value={form.type}
                  disabled={form.mode === 'edit'}
                  onChange={(e) => setForm({ ...form, type: e.target.value as SourceType })}
                >
                  <option value="jira">Jira</option>
                  <option value="email">Email / Exchange</option>
                  <option value="meeting">Meeting Minutes</option>
                  <option value="teams">Microsoft Teams</option>
                  <option value="slack">Slack</option>
                </select>
              </div>

              {isManualType ? (
                <div className={styles.formGroup}>
                  <div className={styles.meetingNote}>
                    Meeting Minutes use manual file upload — no endpoint or API token required.
                    Use the <strong>↑ Upload File</strong> button on the source card to add transcripts.
                  </div>
                </div>
              ) : (
                <>
                  {/* Endpoint / Account */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      {form.type === 'email' ? 'Email Account' : 'Endpoint URL'}
                    </label>
                    <input
                      className={styles.formInput}
                      type={form.type === 'email' ? 'email' : 'text'}
                      placeholder={form.type === 'email' ? 'you@company.com' : 'yourcompany.atlassian.net'}
                      value={form.endpoint}
                      onChange={(e) => setForm({ ...form, endpoint: e.target.value })}
                    />
                  </div>

                  {/* API Token */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>API Token / Password</label>
                    <div className={styles.passwordWrapper}>
                      <input
                        className={styles.formInput}
                        type={showToken ? 'text' : 'password'}
                        placeholder={form.mode === 'edit' ? '••••••••  (leave blank to keep)' : 'Paste your token here'}
                        value={form.token}
                        onChange={(e) => setForm({ ...form, token: e.target.value })}
                      />
                      <button className={styles.showBtn} onClick={() => setShowToken((v) => !v)}>
                        {showToken ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  {/* Polling interval */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Polling Interval (minutes)</label>
                    <input
                      className={styles.formInput}
                      type="number"
                      min={5}
                      max={1440}
                      placeholder="30"
                      value={form.pollingInterval}
                      onChange={(e) => setForm({ ...form, pollingInterval: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className={styles.formDivider} />

              {/* Active toggle */}
              {!isManualType && (
                <div className={styles.formGroup}>
                  <div className={styles.toggleRow}>
                    <span className={styles.toggleLabel}>Enable automatic polling</span>
                    <label className={styles.toggle}>
                      <input
                        type="checkbox"
                        checked={form.active}
                        onChange={(e) => setForm({ ...form, active: e.target.checked })}
                      />
                      <span className={styles.toggleSlider} />
                    </label>
                  </div>
                </div>
              )}

              <div className={styles.formActions}>
                <button className={styles.cancelFormBtn} onClick={() => setForm(null)}>
                  Cancel
                </button>
                <button className={styles.saveBtn} onClick={handleSave}>
                  {form.mode === 'add' ? 'Add Source' : 'Save Changes'}
                </button>
              </div>

              <p className={styles.formNote}>Credentials are stored encrypted at rest.</p>
            </>
          )}
        </div>
      </div>

      {/* ── Remove confirmation modal ── */}
      {removeId && (() => {
        const src = sources.find((s) => s.id === removeId);
        return (
          <div className={styles.overlay} onClick={() => setRemoveId(null)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalIcon}>🗑</div>
              <p className={styles.modalTitle}>Remove {src?.name}?</p>
              <p className={styles.modalText}>
                This will disconnect the source and stop all future ingestion.
                Previously imported tasks will not be deleted.
              </p>
              <div className={styles.modalActions}>
                <button className={styles.modalCancelBtn} onClick={() => setRemoveId(null)}>
                  Cancel
                </button>
                <button className={styles.modalRemoveBtn} onClick={handleRemoveConfirm}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}

const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  jira:    'Jira',
  email:   'Email / Exchange',
  meeting: 'Meeting Minutes',
  teams:   'Microsoft Teams',
  slack:   'Slack',
};

export default DataSources;
