import React, { useState } from 'react';
import styles from './Notifications.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

type ChannelId = 'email' | 'teams' | 'slack' | 'webhook';

interface Channel {
  id: ChannelId;
  name: string;
  description: string;
  icon: string;
  iconBg: string;
  enabled: boolean;
  webhookUrl?: string;
}

interface EventRule {
  id: string;
  label: string;
  description: string;
  email: boolean;
  teams: boolean;
  slack: boolean;
}

interface DigestSettings {
  frequency: 'realtime' | 'hourly' | 'daily' | 'never';
  digestTime: string;
  quietEnabled: boolean;
  quietFrom: string;
  quietTo: string;
}

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL_CHANNELS: Channel[] = [
  {
    id: 'email',
    name: 'Email',
    description: 'linh@fpt.com',
    icon: '✉',
    iconBg: 'rgba(139,92,246,0.15)',
    enabled: true,
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    description: 'General channel · FPT Software',
    icon: 'T',
    iconBg: 'rgba(99,102,241,0.15)',
    enabled: true,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: '#task-mom-alerts · FPT Workspace',
    icon: 'S',
    iconBg: 'rgba(16,185,129,0.15)',
    enabled: false,
  },
  {
    id: 'webhook',
    name: 'Webhook',
    description: 'POST to a custom URL',
    icon: '⚡',
    iconBg: 'rgba(245,158,11,0.15)',
    enabled: false,
    webhookUrl: '',
  },
];

const INITIAL_RULES: EventRule[] = [
  {
    id: 'new_tasks',
    label: 'New tasks detected',
    description: 'When the agent extracts new tasks from any source',
    email: true,
    teams: true,
    slack: false,
  },
  {
    id: 'urgent',
    label: 'Urgent task assigned',
    description: 'When a task with High priority is added',
    email: true,
    teams: true,
    slack: false,
  },
  {
    id: 'deadline_today',
    label: 'Deadline today',
    description: 'Reminder when a task is due today',
    email: true,
    teams: false,
    slack: false,
  },
  {
    id: 'deadline_tomorrow',
    label: 'Deadline tomorrow',
    description: 'Reminder when a task is due the next day',
    email: false,
    teams: false,
    slack: false,
  },
  {
    id: 'ingestion_failed',
    label: 'Ingestion failure',
    description: 'When a data source fails to sync',
    email: true,
    teams: true,
    slack: false,
  },
  {
    id: 'daily_briefing',
    label: 'Daily briefing ready',
    description: 'When the morning briefing is generated',
    email: false,
    teams: true,
    slack: false,
  },
  {
    id: 'task_overdue',
    label: 'Task overdue',
    description: 'When a task passes its deadline without being completed',
    email: true,
    teams: false,
    slack: false,
  },
];

const INITIAL_DIGEST: DigestSettings = {
  frequency: 'daily',
  digestTime: '08:00',
  quietEnabled: true,
  quietFrom: '22:00',
  quietTo: '07:00',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Notifications() {
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [rules, setRules]       = useState<EventRule[]>(INITIAL_RULES);
  const [digest, setDigest]     = useState<DigestSettings>(INITIAL_DIGEST);
  const [savedMsg, setSavedMsg] = useState(false);
  const [webhookModal, setWebhookModal] = useState<{ url: string } | null>(null);

  function toggleChannel(id: ChannelId) {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)),
    );
  }

  function toggleRule(ruleId: string, col: 'email' | 'teams' | 'slack') {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, [col]: !r[col] } : r)),
    );
  }

  function handleSave() {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  }

  function openWebhook() {
    const ch = channels.find((c) => c.id === 'webhook');
    setWebhookModal({ url: ch?.webhookUrl ?? '' });
  }

  function saveWebhook() {
    if (!webhookModal) return;
    setChannels((prev) =>
      prev.map((c) =>
        c.id === 'webhook'
          ? { ...c, webhookUrl: webhookModal.url, description: webhookModal.url || 'POST to a custom URL', enabled: !!webhookModal.url }
          : c,
      ),
    );
    setWebhookModal(null);
  }

  const enabledChannelIds = new Set(channels.filter((c) => c.enabled).map((c) => c.id));

  return (
    <>
      <div className={styles.layout}>
        {/* ── Left column ── */}
        <div>
          {/* Delivery channels */}
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Delivery Channels</p>
            <div className={styles.channelList}>
              {channels.map((ch) => (
                <div key={ch.id} className={styles.channelCard}>
                  <div className={styles.channelIcon} style={{ background: ch.iconBg }}>
                    {ch.icon}
                  </div>
                  <div className={styles.channelInfo}>
                    <div className={styles.channelName}>{ch.name}</div>
                    <div className={styles.channelDesc}>{ch.description}</div>
                  </div>
                  <div className={styles.channelActions}>
                    {ch.id === 'webhook' && (
                      <button className={styles.configureBtn} onClick={openWebhook}>
                        Configure
                      </button>
                    )}
                    <label className={styles.toggle}>
                      <input
                        type="checkbox"
                        checked={ch.enabled}
                        onChange={() => toggleChannel(ch.id)}
                      />
                      <span className={styles.toggleSlider} />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event rules */}
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Notification Events</p>
            <div className={styles.ruleList}>
              {/* Header row */}
              <div className={styles.ruleRow}>
                <div className={styles.ruleLabel} />
                <div className={styles.ruleToggles}>
                  {(['email', 'teams', 'slack'] as const).map((col) => (
                    <div key={col} className={styles.ruleToggleCol}>
                      <span className={styles.ruleToggleHeader}>{col}</span>
                    </div>
                  ))}
                </div>
              </div>

              {rules.map((rule) => (
                <div key={rule.id} className={styles.ruleRow}>
                  <div className={styles.ruleLabel}>
                    {rule.label}
                    <span className={styles.ruleDesc}>{rule.description}</span>
                  </div>
                  <div className={styles.ruleToggles}>
                    {(['email', 'teams', 'slack'] as const).map((col) => (
                      <div key={col} className={styles.ruleToggleCol}>
                        <label className={styles.toggle}>
                          <input
                            type="checkbox"
                            checked={rule[col]}
                            disabled={!enabledChannelIds.has(col)}
                            onChange={() => toggleRule(rule.id, col)}
                          />
                          <span className={styles.toggleSlider} />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div>
          {/* Digest frequency */}
          <div className={styles.panel}>
            <p className={styles.panelTitle}>Digest Frequency</p>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Send summary</label>
              <select
                className={styles.fieldSelect}
                value={digest.frequency}
                onChange={(e) => setDigest({ ...digest, frequency: e.target.value as DigestSettings['frequency'] })}
              >
                <option value="realtime">Real-time (as events happen)</option>
                <option value="hourly">Hourly digest</option>
                <option value="daily">Daily digest</option>
                <option value="never">Never (disable all)</option>
              </select>
            </div>

            {digest.frequency === 'daily' && (
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Delivery time</label>
                <select
                  className={styles.fieldSelect}
                  value={digest.digestTime}
                  onChange={(e) => setDigest({ ...digest, digestTime: e.target.value })}
                >
                  {['06:00','07:00','08:00','09:00','10:00','12:00','17:00','18:00'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quiet hours */}
          <div className={styles.panel}>
            <p className={styles.panelTitle}>Quiet Hours</p>
            <div className={styles.fieldGroup}>
              <div className={styles.toggleRow}>
                <span className={styles.toggleLabel}>Enable quiet hours</span>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={digest.quietEnabled}
                    onChange={(e) => setDigest({ ...digest, quietEnabled: e.target.checked })}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>
            </div>

            {digest.quietEnabled && (
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Do not disturb from — to</label>
                <div className={styles.timeRow}>
                  <select
                    className={styles.fieldSelect}
                    value={digest.quietFrom}
                    onChange={(e) => setDigest({ ...digest, quietFrom: e.target.value })}
                  >
                    {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span className={styles.timeSep}>→</span>
                  <select
                    className={styles.fieldSelect}
                    value={digest.quietTo}
                    onChange={(e) => setDigest({ ...digest, quietTo: e.target.value })}
                  >
                    {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>

          <button className={styles.saveBtn} onClick={handleSave}>Save Preferences</button>
          {savedMsg && <p className={styles.savedMsg}>✓ Preferences saved</p>}
        </div>
      </div>

      {/* ── Webhook modal ── */}
      {webhookModal !== null && (
        <div className={styles.overlay} onClick={() => setWebhookModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.modalTitle}>Configure Webhook</p>
            <input
              className={styles.modalInput}
              type="url"
              placeholder="https://your-server.com/webhook"
              value={webhookModal.url}
              onChange={(e) => setWebhookModal({ url: e.target.value })}
            />
            <p className={styles.modalNote}>
              Task Mom will POST a JSON payload to this URL whenever a notification event fires.
              The endpoint must return HTTP 2xx within 5 seconds.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancelBtn} onClick={() => setWebhookModal(null)}>
                Cancel
              </button>
              <button className={styles.modalSaveBtn} onClick={saveWebhook}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const HOURS = [
  '00:00','01:00','02:00','03:00','04:00','05:00',
  '06:00','07:00','08:00','09:00','10:00','11:00',
  '12:00','13:00','14:00','15:00','16:00','17:00',
  '18:00','19:00','20:00','21:00','22:00','23:00',
];

export default Notifications;
